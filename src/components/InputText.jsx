// import PropTypes from 'prop-types';

import {forwardRef, useState, useEffect} from 'react'
import * as R from 'ramda'

import { Grid } from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Select from '@mui/material/Select';
import useMediaQuery from '@mui/material/useMediaQuery';

import AuthorProgress from './AuthorProgress'
import SnackbarAlerts from './SnackbarAlerts'

import "./InputText.css";

import {PARSERS as P,
        tagWordsInLine,
        ParserDescriptions} from './ParserDescriptions'

import sonnets, { 
    defaultAuthor, defaultAuthorList,
    defaultTitle, defaultTitleList,
    defaultTextLines,
    defaultTitlesByAuthor } from '../data/sonnets.js'

function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj))
}

let fetchedPoems = sonnets
let titlesByAuthor = deepClone(defaultTitlesByAuthor)

// debug
// const poetryURLs = ['https://poetrydb.org', 'http://165.227.95.56:3000']
const poetryURLs = ['http://this-will-fail.com', 'http://165.227.95.56:3000']

const defaultParserName = P.PARTS_OF_SPEECH

const punct = /([.,\/#!$%\^&\*;:{}=\-_`~()]+)/gm
const spacePunct = /([\s.,\/#!$%\^&\*;:{}=\-_`~()]+)/gm
const UNICODE_NBSP = "\u00A0"

const PRE = "word" // prefix for identifying word spans by computed id

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function InputText(props) {

    // my suspicion is that when I added a sufficiently large number of
    // state hooks, it was no long reliable that textLines is set to
    // defaultTextLines (implying useState is actually async)
    let [textLines, setTextLines] = useState(defaultTextLines)
    // console.log("1", {defaultTextLines})
    // console.log("1", {textLines})
    textLines = textLines || defaultTextLines
    // console.log("2", {defaultTextLines})
    // console.log("2", {textLines})
    const [parserName, setParserName] = useState(defaultParserName)
    const [author, setAuthor] = useState(defaultAuthor)
    const [authorList, setAuthorList] = useState(defaultAuthorList)
    const [title, setTitle] = useState(defaultTitle)
    const [titleList, setTitleList] = useState(defaultTitleList)

    const [toast, setToast] = useState({open: false, severity: "info", message: ""})

    const [loadingProgress, setLoadingProgress] = useState({author: "", percentage: 0})

    const extraLargeScreen = useMediaQuery(theme => theme.breakpoints.up('xl'));

    // store a noun inverter for each parser (which are the keys)
    const [nounInverters, setNounInverters] = useState({
        [P.PARTS_OF_SPEECH]: [],
        [P.EN_POS]: [],
    }) 
    // nounInverter values are jagged arrays of arrays indicating if a word at a
    //    given index (in a given line)
    //    is an inversion from the noun-state by the parserName
    //    e.g. nounInverters[P.PARTS_OF_SPEECH][3][7] === true 
    //      means that the eighth word (7+1) in the fourth (3+1) line (for the
    //      P.PARTS_OF_SPEECH parser) has been inverted
    //    i.e. inverted means now should be considered not-a-noun if originally
    //      a noun or vice-versa

    const [falsePositiveCount, setFalsePositiveCount] = useState({
        [P.PARTS_OF_SPEECH]: 0,
        [P.EN_POS]: 0,
    })

    const [falseNegativeCount, setFalseNegativeCount] = useState({
        [P.PARTS_OF_SPEECH]: 0,
        [P.EN_POS]: 0,
    })

    // Utility for setting statistics
    function updateValueForCurrentParser(setter, value) {
        setter ( prevObj => ({...prevObj, [parserName]: value}) )
    }

    function setSnackOpen(openOrClosed) {
        setToast( prevToast => ({...prevToast, open: openOrClosed}) )
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
            const matchedSpacePunct = line.match(spacePunct).map(
                s => s.replace(/ /g, UNICODE_NBSP)
            )

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
        if (nounInverter.length === 0) {
            // only set this once on initial load
            updateValueForCurrentParser(setNounInverters, newNounInverter)
        }
        document.getElementById("text-output").innerHTML = outlined.join('<br>')
        updateValueForCurrentParser(
            setFalsePositiveCount,
            document.getElementsByClassName("non-noun inverted").length
        )
        updateValueForCurrentParser(
            setFalseNegativeCount,
            document.getElementsByClassName("noun inverted").length
        )
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
                    event.stopPropagation() // still fails to stop 2nd invertNoun call
                })
            }
        }
    }

    useEffect(drawNounOutlines, [textLines, parserName, nounInverters])

    function handleParserChange(event) {
        const {value} = event.target
        setParserName(value)
    }

    // generic selector used for authors and titles
    function selector(selName, value, setter, valList) {
        return (
            <FormControl dense="true">
              <InputLabel id={`${selName}-select-label`}>{capitalizeFirstLetter(selName)}</InputLabel>
              <Select
                labelId={`${selName}-select-label`}
                id={`${selName}-select`}
                value={value}
                label={capitalizeFirstLetter(selName)}
                onChange={ (event) => setter(event.target.value) }
              >
                {valList.map( s => (<MenuItem value={s}>{s}</MenuItem>) )}
              </Select>
            </FormControl>
        )
    }

    function authorSelector() {
        return selector('author', author, setAuthor, authorList)
    }

    function titleSelector() {
        return selector('title', title, setTitle, titleList)
    }

    function toastAlert(message, severity) {
        setToast({message, severity, open: true})
    }

    useEffect( () => {
        async function fetchAuthorsAndTitles(url) {
            const authorURL = url + '/author'
            let response = await fetch(authorURL)
            const authorJSON = await response.json()
            const authors = authorJSON.authors
            const numAuthors = authors.length
            let countAuthors = 0

            // console.log({authorURL})
            // console.log({authors})

            if (authors.length === 0) {
                throw `No authors found at ${authorURL}`
            }

            // fetch all the new poems before triggering an author / title change
            for (let author of authors) {
                let poemsByAuthorURL = `${url}/author/${encodeURIComponent(author.trim())}`
                // console.log("author loop", {poemsByAuthorURL})
                setLoadingProgress({author, percentage: 100 * (++countAuthors / numAuthors)})
                // console.log("author loop A", 100 * (countAuthors / numAuthors), "%")

                response = await fetch(poemsByAuthorURL)
                let fetchedPoemsInitial = await response.json()

                // console.log("author loop", {fetchedPoemsInitial})

                titlesByAuthor = titlesByAuthor ? titlesByAuthor : {}
                titlesByAuthor[author] = []
                fetchedPoems = fetchedPoems ? fetchedPoems : {}
                fetchedPoems[author] = {}
                for (let poem of fetchedPoemsInitial) {
                    titlesByAuthor[author].push(poem.title)
                    fetchedPoems[author][poem.title] = poem.lines
                }
            }

            // Choose the 2nd poet just because we want it to be Emily Dickinson in our common case
            // or 1st (0th) if we end up with a one poet list
            const authorIndex = Math.min(1, authors.length-1) 

            // Set titles first because it is reverse order of triggering updates to selectors
            const titles = titlesByAuthor[authors[authorIndex]]
            setTitleList(titles)

            setAuthorList(authors)
            setAuthor(authors[authorIndex])
            return [authors, titles]
        }
        let fetchedPromises = []
        for (let url of poetryURLs) {
            fetchedPromises.push(
                fetchAuthorsAndTitles(url)
                    .catch( (error) => toastAlert(`${error.message}: ${url}`, "warning"))
            )
        }
        Promise.all(fetchedPromises)
    }, [])

    useEffect( () => {
        if (titlesByAuthor !== undefined) {
            const titles = titlesByAuthor[author]
            setTitleList(titles)
            setTitle(titles[0])
        }
    }, [author] )

    useEffect( () => {
        // When the title changes, the entire poem changes
        if (fetchedPoems !== undefined) {
            // reset the noun inverter so this it will be reconstructed for the current parser
            updateValueForCurrentParser(setNounInverters, []) 
            setTextLines(fetchedPoems[author][title])
        }
    }, [title] )

  return (
    <section>
        <Grid container spacing={2} direction={extraLargeScreen?"row":"column"}>
            <Grid item xs={6}>
              <h1> Select a poem </h1>
              { authorSelector() }
              { titleSelector() }
              { loadingProgress.percentage > 0 &&
                loadingProgress.percentage < 100 && 
                <AuthorProgress {...loadingProgress}/>  }
              <textarea value={textLines && textLines.join("\n")} id="text-input"/>
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
                    <li>Click on a word with the <span className="non-noun">Plus</span> <img id="non-noun-cursor-img"></img> cursor to change a word INTO a noun.</li>
                    <li>Click on a word with the <span className="noun">Back</span> <img id="noun-cursor-img"></img> cursor to change a word BACK TO a non-noun.</li>
                </ul>
                <div id="text-output"></div>
                <fieldset id="stats-fieldset">
                    <legend id="stats-legend"><b><i>Statistics for {parserName}</i></b></legend>
                    <div>
                        <span><b>False Positives:</b> {falsePositiveCount[parserName]}  </span>
                        <span><b>False Negatives:</b> {falseNegativeCount[parserName]}</span> 
                    </div>
                    <b>Total Incorrect:</b> {falsePositiveCount[parserName] + falseNegativeCount[parserName]}
                </fieldset>
            </Grid>
        </Grid>
      <SnackbarAlerts {...{...toast, setSnackOpen}}/>
    </section>
  )
    }

export default InputText;
