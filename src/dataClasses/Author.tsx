import { z } from "zod";

import { author as authorSchema} from "../type-definitions.zod"

import { NounInverterFactory } from "./NounInverter";
import { Parser } from "./Parser";
import Poem from "./Poem";

import {
  defaultAuthorName,
  defaultAuthorNames,
  defaultTitles,
} from "../data/sonnets";
import { AuthorType } from "src/type-definitions";

// this is defined in a prototypical way to make use of zod parsing.
export default class Author {};
Author.prototype.constructor = function (this: AuthorType, data: Author) {
  Object.assign(this, authorSchema.parse(data));
  this.nounInverterFactory = new NounInverterFactory(this);
  this.stagedTitleChange = this.currentPoem.title;
  this.recomputeNounOutlines();
};
Author.prototype.recomputeNounOutlines = function (this: AuthorType) {
  this.nounInverter = this.nounInverterFactory.get(this);
  this.nounInverter!.recomputeNounOutlines();
}
// TODO go through code and replace setters for poem and parser with these
Author.prototype.setPoem = function (this: AuthorType, newPoem: Poem) {
  this.currentPoem = newPoem;
  this.recomputeNounOutlines!();
}
Author.prototype.setParser = function (this: AuthorType, newParser: Parser) {
  this.currentParser = newParser;
  this.recomputeNounOutlines!();
}
Author.prototype.updateCurrentStats = function (this: AuthorType, stats: Stats) {
  const nounInverter = this.nounInverter;
  if (nounInverter) {
    nounInverter.falsePositiveCount = falsePos;
    nounInverter.falseNegativeCount = falseNeg;
  }
}s