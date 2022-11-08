import { NounInverter, NounInverterMap } from "./NounInverter";
import { defaultParser } from "../dataClasses/Parser";
import { defaultPoem } from "./Poem";

import {
  defaultAuthorName,
  defaultAuthorNames,
  defaultTitles,
  defaultTitlesByAuthor,
} from "../data/sonnets";

const requiredKeys = "name titles authorNames currentPoem currentParser".split(
  " "
);

let memoCache = new Map();

// TODO this should just be the internal rep of NounInverterMap
function memoize(func) {
  return (...args) => {
    const joinedArgs = args.join(" -- ");
    console.log({ joinedArgs });
    console.log({ memoCache });
    if (!memoCache.has(joinedArgs)) {
      console.log("  COMPUTING func!");
      memoCache.set(joinedArgs, func(...args));
    } else {
      console.log("  NOT computing func!");
    }
    return memoCache.get(joinedArgs);
  };
}

export default class AuthorData {
  /* data should include these fields pertaining to an author:

      name
      titles
      authorNames
      currentPoem
      currentParser

      Creates a nounInverters field (NounInverterMap) based on the lines of the
      current poem

      */
  constructor(data) {
    Object.assign(this, data);

    for (const key of requiredKeys)
      if (!(key in this))
        console.warn(`AuthorData constructed without required key ${key}`);
    this.initNounInverter();
  }

  /*
      initialize a noun inverter for the current data
      sets the current NounInverter which can be retrieved with
      authorData.getNounInverter()

      You can optionally pass in a new poem to be used in the case
      where the NounInverterMap needs to be created *before* the
      currentPoem is officially set (because the change in poem title
      will trigger a rerender before the new NounInverter is in place)
    */
  initNounInverter(poem) {
    if (poem === undefined) {
      poem = this.currentPoem;
    }
    if (this.currentParser && this.currentPoem) {
      const memoizedGetNounInverters = memoize((parserName, author, title) => {
        console.log(`Creating new NounInverter for "${poem.title}"`);
        console.log(`  args: '${parserName}', '${author}', '${title}'`);
        return new NounInverterMap(
          parserName,
          author,
          title,
          new NounInverter(this.currentParser, poem.lines)
        );
      });
      this.nounInverters = memoizedGetNounInverters(
        this.currentParser.name,
        poem.author,
        poem.title
      );
    } else {
      this.nounInverters = null;
    }
  }

  /* When setting a new poem outside of the constructor always call this
      `setPoem` Sets the poem, but also importantly resets the nounInverter
      before setting the current poem
    */
  setPoem(newPoem) {
    this.initNounInverter(newPoem);
    this.currentPoem = newPoem;
  }

  getNounInverter() {
    return this.nounInverters ? this.nounInverters.getCurrent() : null;
  }

  recomputeNounOutlinesHTML() {
    return this.getNounInverter()?.recomputeNounOutlinesHTML();
  }

  updateCurrentStats({ falsePos, falseNeg }) {
    // need to return the new version for authorData update, right?
    const nounInverter = this.getNounInverter();
    if (nounInverter) {
      nounInverter.falsePositiveCount = falsePos;
      nounInverter.falseNegativeCount = falseNeg;
    }
  }
}

export const defaultAuthorData = new AuthorData({
  name: defaultAuthorName,
  titles: defaultTitles,
  authorNames: defaultAuthorNames,
  currentPoem: defaultPoem,
  currentParser: defaultParser,
});
