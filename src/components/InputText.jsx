// import PropTypes from 'prop-types';

import { Grid } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

import {useState, useEffect} from 'react'
import * as R from 'ramda'

import "./InputText.css";

import {PARSERS as P, tagWordsInLine, ParserDescriptions} from './ParserDescriptions'

import sonnets from '../data/sonnets.js'

const defaultParserName = P.PARTS_OF_SPEECH
const defaultTextLines = sonnets[60].split('\n')

const punct = /([.,\/#!$%\^&\*;:{}=\-_`~()]+)/gm
const spacePunct = /([\s.,\/#!$%\^&\*;:{}=\-_`~()]+)/gm
// const notSpacePunct = /([^\s.,\/#!$%\^&\*;:{}=\-_`~()]+)/gm
const UNICODE_NBSP = "\u00A0"

const PRE = "word"

function InputText(props) {
    const [textLines, setTextLines] = useState(defaultTextLines)
    const [parserName, setParserName] = useState(defaultParserName)

    const extraLargeScreen = useMediaQuery(theme => theme.breakpoints.up('xl'));

    // store a noun inverter for each parser (which are the keys)
    const [nounInverters, setNounInverters] = useState({
        [P.PARTS_OF_SPEECH]: [],
        [P.EN_POS]: [],
    }) 
    // nounInverter values are jagged arrays of arrays indicating if a word at a given index (in a given line)
    //    is an inversion from the noun-state by the parserName
    //    e.g. nounInverters[P.PARTS_OF_SPEECH][3][7] === true 
    //      means that the eighth word in the fourth line (for the P.PARTS_OF_SPEECH parser) has been inverted
    //    i.e. inverted means now should be considered not-a-noun if originally a noun or vice-versa

    const [falsePositiveCount, setFalsePositiveCount] = useState({
        [P.PARTS_OF_SPEECH]: 0,
        [P.EN_POS]: 0,
    })

    const [falseNegativeCount, setFalseNegativeCount] = useState({
        [P.PARTS_OF_SPEECH]: 0,
        [P.EN_POS]: 0,
    })

    function updateValueForCurrentParser(setter, value) {
        setter ( prevObj => ({...prevObj, [parserName]: value}) )
    }

    function drawNounOutlines() {
        const nounInverter = nounInverters[parserName]

        let outlined = []
        let newNounInverter

        if (nounInverter.length === 0) {
            newNounInverter = new Array(textLines.length).fill([])
        } else {
            newNounInverter = R.clone(nounInverter)
        }

        textLines.forEach( (line, lineNum) => {      
            if (line === '') {
                outlined.push('')
                return
            }
            const matchedSpacePunct = line.match(spacePunct).map( s => s.replace(/ /g, UNICODE_NBSP) )

            let taggedWords = tagWordsInLine[parserName](line.replaceAll(punct, ''));
            if (newNounInverter[lineNum].length === 0) {
                newNounInverter[lineNum] = new Array(taggedWords.length).fill(false)
            }

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
        if (nounInverter.length === 0) updateValueForCurrentParser(setNounInverters, newNounInverter) // only set it once on initial load
        document.getElementById("text-output").innerHTML = outlined.join('<br>')
        updateValueForCurrentParser(setFalsePositiveCount, document.getElementsByClassName("non-noun inverted").length)
        updateValueForCurrentParser(setFalseNegativeCount, document.getElementsByClassName("noun inverted").length)
        addClickHandlersToSpans()
    }

    function invertNoun(line, word) {
        setNounInverters( prevNounInverters => {
            const newNounInverter = R.clone(prevNounInverters[parserName])
            newNounInverter[line][word] = !newNounInverter[line][word]
            return {...prevNounInverters, [parserName]: newNounInverter}
        })
        drawNounOutlines()
    }

    const addNounSpans = (tagged, lineNum) => {
        const nounInverter = nounInverters[parserName]
        let mainClass
        let extraClasses
        let wordNum = 0        
        return tagged.map( ([word, tag]) => {
            extraClasses = ""
            let nounTest = (tag === 'NN' || tag === 'NNS')
            if (nounInverter.length > 0 && nounInverter[lineNum][wordNum]) {
                nounTest = !nounTest
                extraClasses = "inverted"
            }
            mainClass = nounTest ? "noun" : "non-noun"
            return `<span class="${mainClass} ${extraClasses}" id="${PRE}_${lineNum}_${wordNum++}">${word}</span>`
        })
    }

    function addClickHandlersToSpans() {
        const classNames = ['noun', 'non-noun']
        for (const className of classNames) {
            const spans = document.getElementsByClassName(className)
            for (const span of spans) {
                span.addEventListener('click', (event) => {
                    const [line, word] = event.target.id.split('_').slice(1)
                    invertNoun(parseInt(line, 10), parseInt(word, 10))
                    event.stopPropagation() // thought this might stop the 2nd call to invertNoun, but it doesn't
                })
            }
        }
    }

    useEffect(drawNounOutlines, [textLines, parserName, nounInverters])

    function handleParserChange(event) {
        const {value} = event.target
        setParserName(value)
    }

  return (
    <section>
        <Grid container spacing={2} direction={extraLargeScreen?"row":"column"}>
            <Grid item xs={6}>
                <h1> For now, a poem... </h1>
                <textarea value={textLines.join("\n")} id="text-input"/>
            </Grid>
            <Grid item xs={6}>
                <h1> Choose your Natural Language Parser </h1>
                <div>
                    <ParserDescriptions />
                    <FormControl>
                        <FormLabel id="parsers-radio-buttons-group-label">Parsers</FormLabel>
                        <RadioGroup
                            row
                            aria-labelledby="parsers-radio-buttons-group-label"
                            defaultValue={defaultParserName}
                            name="parserName"
                            value={parserName}
                            onChange={handleParserChange}
                        >
                            <FormControlLabel value="parts-of-speech" control={<Radio />} label="Parts-of-Speech" />
                            <FormControlLabel value="en-pos" control={<Radio />} label="en-pos" />
                        </RadioGroup>
                    </FormControl> 
                </div>
                <h1> Correct what is and is not a noun </h1>
                <ul>
                    <li>Click on a word with the <span class="non-noun">Plus</span> 
                        <img id="non-noun-cursor-img"></img> cursor to change a word INTO a noun.</li>
                    <li>Click on a word with the <span class="noun">Back</span> 
                        <img id="noun-cursor-img"></img> cursor to change a word BACK TO a non-noun.</li>
                </ul>
                <div id="text-output"></div>
                <fieldset>
                    <legend><b><i>Statistics for {parserName}</i></b></legend>
                    <div>
                        <span><b>False Positives:</b> {falsePositiveCount[parserName]}  </span>
                        <span><b>False Negatives:</b> {falseNegativeCount[parserName]}</span> 
                    </div>
                    <b>Total Incorrect:</b> {falsePositiveCount[parserName] + falseNegativeCount[parserName]}
                </fieldset>
            </Grid>
        </Grid>
    </section>
  )
}

export default InputText;
