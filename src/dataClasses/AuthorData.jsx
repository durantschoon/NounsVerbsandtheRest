import {useMemo} from 'react';

import {NounInverterMap} from './NounInverter'

const spannedWord = (mainClass, extraClasses, lineNum, wordNum) => (
    `<span class="${mainClass} ${extraClasses}" id="word_${lineNum}_${wordNum}">
       ${word}
     </span>`
)

// returns html
const addNounSpans = (tagged, lineNum) => {
    const nounInverter = authorData.getNounInverter()
    let mainClass
    let extraClasses
    let wordNum = 0
    return tagged.map( ([word, tag]) => {
        extraClasses = ""
        let nounTest = (tag === 'NN' || tag === 'NNS')
        if (nounInverter.get(lineNum, wordNum)) {
            nounTest = !nounTest
            extraClasses = "inverted"
        }
        mainClass = nounTest ? "noun" : "non-noun"
        return spannedWord(mainClass, extraClasses, lineNum, wordNum++)
    })
}

const requiredKeys = "name titles authorNames currentPoem currentParser".split(' ')

class AuthorData {
    /* data should include these fields pertaining to an author:

      name
      titles
      authorNames
      currentPoem
      currentParser

      Creates a nounInverters field (NounInverterMap) based on the lines of the
      current poem

      */
    constuctor(data) {
        Object.assign(this, data)
        for (const key of requiredKeys)
            if ( ! key in this )
                console.warn(`AuthorData constructed without required key ${key}`)
        this.initNounInverter()
    }

    // initialize a noun inverter for the current data
    // sets the current NounInverter which can be retrieved with
    // authorData.getNounInverter()
    initNounInverter() {
        if (this.currentParser && this.currentPoem) {
            this.nounInverters = useMemo( ({
                [this.currentParser.name]: parser,
                [this.currentPoem.author]: author,
                [this.currentPoem.title]: title,
                [this.currentPoem.lines]: lines,
            }) => new NounInverterMap(parser, author, title, new NounInverter(lines)))
        }
    }

    getNounInverter() {
        return this.nounInverters.getCurrent()
    }

    /* FIXME stopped here, working on this
      Return the HTML of all the words tagged (as either noun or non-noun)

      Should only be run in the scope of AuthorDataUpdater to reference aDataClone
      */
    getTaggedWordsHTML() {

        let outlined = []

        let newNounInverter = aDataclone.getNounInverter()
        let parser = this.currentParser

        console.log({newNounInverter})

        /* Algorithm
          - match the spaces and punctuation, save that as matchedSpacePunct
          - remove all the punctuation from the words and tag, saving in as
            parser.tagWordsInLine
          - Add the lines to the NounInverter
          - Even out the saved punctuation and lines for recombination
          - Recombine the spaces and words in the right order, save as outlined
          */

        const lines = this.currentPoem.lines
        console.log("lines", lines)
        lines.forEach( (line, lineNum) => {
            if (line === '') {
                outlined.push('')
                return
            }
            const matchedSpacePunct = line.match(spacePunct).map(
                s => s.replace(/ /g, UNICODE_NBSP)
            )

            let taggedWords = parser.tagWordsInLine(line.replaceAll(punct, ''));
            newNounInverter.initLineIfNeeded(lineNum, taggedWords.length)

            // even out the lengths of the two arrays for zipping
            if (matchedSpacePunct.length < taggedWords.length) {
                matchedSpacePunct.push('')
            } else if (taggedWords.length < matchedSpacePunct.length) {
                taggedWords.push(['', ''])
            }

            // zip results in the correct order (i.e. starting with a space or not)
            let first, second
            if (line[0].match(/\s/)) {
                first = matchedSpacePunct
                second = addNounSpans(taggedWords, lineNum)
            } else {
                first = addNounSpans(taggedWords, lineNum)
                second = matchedSpacePunct
            }
            const recombined = R.unnest(R.zip(first, second)).join('')
            outlined.push(recombined)
        })
    }

    updateCurrentStats({falsePos, falseNeg}) {
        // need to return the new version for authorData update, right? 
        this.getNounInverter().falsePositiveCount = falsePos
        this.getNounInverter().falseNegativeCount = falseNeg
    }
}

