import { z } from "zod";

import { NounInverter, NounInverterFactory } from "./NounInverter";
import { Parser, defaultParser } from "./Parser";
import Poem, { defaultPoem } from "./Poem";

import {
  defaultAuthorName,
  defaultAuthorNames,
  defaultTitles,
} from "../data/sonnets";
import { AuthorName, AuthorData, Title, Stats } from "src/type-definitions";

export default class Author {
  name: AuthorName;
  authorNames: AuthorName[]; // current list of alternative author names
  nounInverterFactory: NounInverterFactory;
  titles: Title[];
  stagedTitleChange: Title;
  currentPoem: Poem;
  nounInverter: NounInverter | undefined;
  currentParser: Parser;

  constructor(data: AuthorData) {
    // TS does not allow Object.assign by itself
    //   because it cannot be certain currentPoem is set
    // Object.assign(this, data); 
    this.name = data.name;
    this.titles = data.titles;
    this.authorNames = data.authorNames;
    this.currentPoem = data.currentPoem;
    this.currentParser = data.currentParser;
    this.nounInverterFactory = new NounInverterFactory(this);
    this.stagedTitleChange = this.currentPoem.title;
    this.recomputeNounOutlines();
  }
  
  recomputeNounOutlines(this: Author) {
    this.nounInverter = this.nounInverterFactory.get(this);
    this.nounInverter!.recomputeNounOutlines();
  }
  
  setPoem(this: Author, newPoem: Poem) {
    this.currentPoem = newPoem;
    this.recomputeNounOutlines!();
  }

  setParser(this: Author, newParser: Parser) {
    this.currentParser = newParser;
    this.recomputeNounOutlines!();
  }

  updateCurrentStats(this: Author,  {falsePos, falseNeg}: Stats) {
    const nounInverter = this.nounInverter;
    if (nounInverter) {
      nounInverter.falsePositiveCount = falsePos;
      nounInverter.falseNegativeCount = falseNeg;
    }
  }
};

export const defaultAuthor = new Author({
  name: defaultAuthorName,
  titles: defaultTitles,
  authorNames: defaultAuthorNames,
  currentPoem: defaultPoem,
  currentParser: defaultParser,
});