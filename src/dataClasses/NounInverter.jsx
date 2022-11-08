// for a specific poem (lines of text)
export class NounInverter {
  constructor(poemTextLines) {
    this.falsePositiveCount = 0;
    this.falseNegativeCount = 0;
    // nounInverters are represented by jagged arrays of arrays indexed by
    //    (line, word) internally represented as zero-based arrays
    //    but externally represented as one-based.
    //    e.g. nounInverter.isInverted(3,7) === true
    //      means that the noun-state assigned by the parser for the word
    //      at line 3, word 7 has been inverted by the user
    //    i.e. inverted means now should be considered not-a-noun if originally
    //      a noun or vice-versa
    this.rep = poemTextLines ? new Array(poemTextLines.length).fill([]) : [[]];
    this._hasInitializedEveryLine = false;
    console.log("NounInverter constructed");
  }
  // line, word are 1-based
  isInverted(line, word) {
    return this.rep[line - 1][word - 1];
  }
  // line, word are 1-based
  setInverted(line, word, wordIsInverted) {
    console.log("setInverted", { line, word, wordIsInverted });
    // debugger;
    this.rep[line - 1][word - 1] = wordIsInverted;
    // debugger;
  }
  // line, word are 1-based
  flip(line, word) {
    console.log("rep before:", this.rep);
    this.setInverted(line, word, !this.isInverted(line, word));
    console.log("rep after:", this.rep);
  }
  // lineNum is 1-based
  initLineIfNeeded(lineNum, lineLength) {
    if (this.rep.length === 0) return;
    if (this.rep[lineNum - 1].length === 0) {
      this.rep[lineNum - 1] = new Array(lineLength).fill(false);
      console.log(`  initialized line`, lineNum);
      // if (lineNum == 6) debugger;
    }
  }
  get clonable() {
    return this._hasInitializedEveryLine;
  }
  // this should only set to true by AuthorData after every line of this
  // NounInverter has been initialized.
  set clonable(hasBeenInitialized) {
    this._hasInitializedEveryLine = hasBeenInitialized;
  }
}

/* NounInverterMap

  Essentially maps (parser, poem) -> nounInverter

  Uses string names as identifiers of the parser and poem because JS Map objects
  are unwieldy

  Behaves as if (parserName, authorName, poemTitle) is a tuple key.

  New practice: the AuthorData should always have a populated current parser,
  poem and nounInverter. So don't worry too much about NounInverterMap.current
  being null.
*/
export class NounInverterMap {
  constructor(parserName, authorName, poemTitle, nounInverter = null) {
    this.current = nounInverter; // might be null
    this.set(parserName, authorName, poemTitle, nounInverter);
  }

  _initKey(parserName, authorName, poemTitle) {
    if (!this.parsers?.[parserName]?.[authorName]?.[poemTitle]) {
      this.rep = this.rep || {};
      this.rep[parserName] = this.rep[parserName] || {};
      this.rep[parserName][authorName] = this.rep[parserName][authorName] || {};
    }
  }

  // also sets this.current to the nounInverter when truthy
  set(parserName, authorName, poemTitle, nounInverter) {
    if (nounInverter) {
      this._initKey(parserName, authorName, poemTitle);
      this.rep[parserName][authorName][poemTitle] = nounInverter;
      this.current = nounInverter;
    }
  }

  // return current NounInverter
  getCurrent() {
    return this.current;
  }
}

export default NounInverter;
