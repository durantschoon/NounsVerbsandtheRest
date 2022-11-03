// for a specific poem (lines of text)
export class NounInverter {
    constructor(poemTextLines) {
        this.falsePositiveCount = 0
        this.falseNegativeCount = 0
        // nounInverters are represented by jagged arrays of arrays indexed by
        //    (line, word) internally represented as zero-based arrays
        //    but externally represented as one-based.
        //    e.g. nounInverter.get(3,7) === true
        //      means that the noun-state assigned by the parser for the word
        //      at line 3, word 7 has been inverted by the user
        //    i.e. inverted means now should be considered not-a-noun if originally
        //      a noun or vice-versa
        this.rep = poemTextLines ? new Array(poemTextLines.length).fill([]) : [[]]
    }
    get(line, word) {
        return this.rep[line-1][word-1]
    }
    set(line, word, isInverted) {
        this.rep[line-1][word-1] = isInverted
    }
    flip(line, word) {
        this.set(line, word, ! this.get(line, word))
    }
    initLineIfNeeded(lineNum, lineLength) { 
        if (this.rep.length === 0) return
        console.log("this.rep[lineNum-1]", this.rep[lineNum-1])
            if (this.rep[lineNum-1].length === 0) {
            this.rep[lineNum-1] = new Array(lineLength).fill(false)
        }
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
    constructor(parserName, authorName, poemTitle, nounInverter=null) {
        this.current = nounInverter // might be null
        this.set(parserName, authorName, poemTitle, nounInverter)
    }

    _initKey(parserName, authorName, poemTitle) {
        if ( ! this.parsers?.[parserName]?.[authorName]?.[poemTitle] ) {
            this.rep = this.rep || {}
            this.rep[parserName] = this.rep[parserName] || {}
            this.rep[parserName][authorName] = this.rep[parserName][authorName] || {}
        }
    }

    // also sets this.current to the nounInverter when truthy
    set(parserName, authorName, poemTitle, nounInverter) {
        if (nounInverter) {
            this._initKey(parserName, authorName, poemTitle)
            this.rep[parserName][authorName][poemTitle] = nounInverter
            this.current = nounInverter
        }
    }

    // return current NounInverter
    getCurrent() { return this.current }
}

export default NounInverter
