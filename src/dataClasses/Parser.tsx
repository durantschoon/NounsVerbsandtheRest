import { Tagger, Lexer } from "parts-of-speech";
import { Tag } from "en-pos";

import * as R from "ramda";

class Parser {
  constructor(name) {
    this.name = name;
  }
}

class PartsOfSpeech extends Parser {
  constructor() {
    super("parts-of-speech");
    this.info = {
      title: "Parts-of-Speech",
      body: "Javascript port of Mark Watson's FastTag Part of Speech Tagger which was itself based on Eric Brill's trained rule set and English lexicon",
      link: "https://github.com/dariusk/pos-js#readme",
    };
  }
  tagWordsInLine(line) {
    let words = new Lexer().lex(line);
    let tagger = new Tagger();
    return tagger.tag(words);
  }
}

class EnPos extends Parser {
  constructor() {
    super("en-pos");
    this.info = {
      title: "en-pos",
      body: "A better English POS tagger written in JavaScript",
      link: "https://github.com/finnlp/en-pos#readme",
    };
  }
  tagWordsInLine(line) {
    line = R.filter(R.identity, line.split(/\s/));
    var tags = new Tag(line)
      .initial() // initial dictionary and pattern based tagging
      .smooth().tags; // further context based smoothing
    const tagged = tags.map((tag, i) => [line[i], tag]);
    return tagged;
  }
}

const PoS = new PartsOfSpeech();
const EnP = new EnPos();

const parsers = [PoS, EnP];
const defaultParser = parsers[0];

let byName = {};
for (let parser of parsers) {
  byName[parser.name] = parser;
}
const parsersByName = Object.freeze(byName);

export { Parser, parsers, defaultParser, parsersByName, PoS, EnP };
