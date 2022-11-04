import * as R from "ramda";

import { NounInverter, NounInverterMap } from "./NounInverter";
import { defaultParser } from "../dataClasses/Parser";
import { defaultPoem } from "./Poem";

import {
  defaultAuthorName,
  defaultAuthorNames,
  defaultTitles,
  defaultTitlesByAuthor,
} from "../data/sonnets";

const spannedWord = (mainClass, extraClasses, lineNum, wordNum, word) =>
  `<span class="${mainClass} ${extraClasses}" id="word_${lineNum}_${wordNum}">
       ${word}
     </span>`;

const punct = /([.,\/#!$%\^&\*;:{}=\-_`~()]+)/gm;
const spacePunct = /([\s.,\/#!$%\^&\*;:{}=\-_`~()]+)/gm;
const UNICODE_NBSP = "\u00A0";

const requiredKeys = "name titles authorNames currentPoem currentParser".split(
  " "
);

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
      const memoizedGetNounInverters = R.memoizeWith(Object, () => {
        return new NounInverterMap(
          this.currentParser.name,
          poem.author,
          poem.title,
          new NounInverter(poem.lines)
        );
      });
      this.nounInverters = memoizedGetNounInverters();
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

  /* Return the HTML of all the words tagged (as either noun or non-noun)

      Should only be run as a self-modifying clone (i.e. called by
      authorDataUpdater)
      */
  getTaggedWordsHTML() {
    const lines = this.currentPoem?.lines;

    if (!lines) {
      return "";
    }
    let outlined = [];

    let newNounInverter = this.getNounInverter();
    let parser = this.currentParser;

    // returns HTML, uses newNounInverter in surrounding scope
    const addNounSpans = (tagged, lineNum) => {
      let mainClass;
      let extraClasses;
      let wordNum = 0;

      return tagged.map(([word, tag]) => {
        extraClasses = "";
        let nounTest = tag === "NN" || tag === "NNS";
        if (newNounInverter.get(lineNum, wordNum)) {
          nounTest = !nounTest;
          extraClasses = "inverted";
        }
        mainClass = nounTest ? "noun" : "non-noun";
        return spannedWord(mainClass, extraClasses, lineNum, wordNum++, word);
      });
    };

    /* Algorithm
          - match the spaces and punctuation, save that as matchedSpacePunct
          - remove all the punctuation from the words and tag, saving in as
            parser.tagWordsInLine
          - Add the lines to the NounInverter
          - Even out the saved punctuation and lines for recombination
          - Recombine the spaces and words in the right order, save as outlined
          */
    lines.forEach((line, index) => {
      let lineNum = index + 1;

      if (line === "") {
        outlined.push("");
        return;
      }
      const matchedSpacePunct = line
        .match(spacePunct)
        .map((s) => s.replace(/ /g, UNICODE_NBSP));

      let taggedWords = parser.tagWordsInLine(line.replaceAll(punct, ""));
      newNounInverter.initLineIfNeeded(lineNum, taggedWords.length);

      // even out the lengths of the two arrays for zipping
      if (matchedSpacePunct.length < taggedWords.length) {
        matchedSpacePunct.push("");
      } else if (taggedWords.length < matchedSpacePunct.length) {
        taggedWords.push(["", ""]);
      }

      // zip results in the correct order (i.e. starting with a space or not)
      let first, second;
      if (line[0].match(/\s/)) {
        first = matchedSpacePunct;
        second = addNounSpans(taggedWords, lineNum);
      } else {
        first = addNounSpans(taggedWords, lineNum);
        second = matchedSpacePunct;
      }
      const recombined = R.unnest(R.zip(first, second)).join("");
      outlined.push(recombined);
    });
    return outlined.join("<br>");
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
