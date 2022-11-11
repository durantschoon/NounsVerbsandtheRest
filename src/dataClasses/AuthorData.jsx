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

      Other added fields:

      - `nounInverter` based on the parser and the lines of the current poem

      - `stagedTitleChange` changing this should trigger an atomic update where
        all the fields of a poem are updated at once
  */
  constructor(data) {
    Object.assign(this, data);
    for (const key of requiredKeys)
      if (!(key in this))
        console.warn(`AuthorData constructed without required key ${key}`);
    this.nounInverterFactory = new NounInverterFactory(this);
    this.stagedTitleChange = this.currentPoem.title;
    this.recomputeNounOutlines();
  }

  set poem(newPoem) {
    this.currentPoem = newPoem;
    this.recomputeNounOutlines();
  }

  set parser(newParser) {
    this.currentParser = newParser;
    this.recomputeNounOutlines();
  }

  recomputeNounOutlines() {
    this.nounInverter = this.nounInverterFactory.get(this);
    this.nounInverter.recomputeNounOutlines();
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
