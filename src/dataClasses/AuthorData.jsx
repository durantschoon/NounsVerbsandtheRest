import { NounInverter, NounInverterFactory } from "./NounInverter";
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

export default class AuthorData {
  /* data should include these fields pertaining to an author:

      name
      titles
      authorNames
      currentPoem
      currentParser

    Creates a nounInverter field based on the parser and the lines of the current poem
  */
  constructor(data) {
    Object.assign(this, data);
    for (const key of requiredKeys)
      if (!(key in this))
        console.warn(`AuthorData constructed without required key ${key}`);
    this.nounInverterFactory = new NounInverterFactory(this);
    this.initNounInverter();
  }

  //initialize a noun inverter for the current data
  initNounInverter() {
    this.nounInverter = this.nounInverterFactory.get(this);
  }

  set poem(newPoem) {
    this.currentPoem = newPoem;
    this.initNounInverter();
  }

  set parser(newParser) {
    this.currentParser = newParser;
    this.initNounInverter();
  }

  recomputeNounOutlinesHTML() {
    return this.nounInverter?.recomputeNounOutlinesHTML();
  }

  updateCurrentStats({ falsePos, falseNeg }) {
    const nounInverter = this.nounInverter;
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
