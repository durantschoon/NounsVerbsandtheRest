// import PropTypes from 'prop-types';

import { Grid } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

import {forwardRef, useState, useEffect} from 'react'
import * as R from 'ramda'

import "./InputText.css";

import {PARSERS as P,
        tagWordsInLine,
        ParserDescriptions} from './ParserDescriptions'

import sonnets, { 
    defaultAuthor, defaultAuthorList,
    defaultTitle, defaultTitleList,
    defaultTextLines,
    defaultTitlesByAuthor as titlesByAuthor } from '../data/sonnets.js'

let fetchedPoems = sonnets

const poetryURLs = ['https://poetrydb.org', 'http://165.227.95.56:3000']

const defaultParserName = P.PARTS_OF_SPEECH

const punct = /([.,\/#!$%\^&\*;:{}=\-_`~()]+)/gm
const spacePunct = /([\s.,\/#!$%\^&\*;:{}=\-_`~()]+)/gm
// const notSpacePunct = /([^\s.,\/#!$%\^&\*;:{}=\-_`~()]+)/gm
const UNICODE_NBSP = "\u00A0"

const PRE = "word"

const Alert = forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function InputText(props) {
    const [textLines, setTextLines] = useState(defaultTextLines)
    const [parserName, setParserName] = useState(defaultParserName)
    const [author, setAuthor] = useState(defaultAuthor)
    const [authorList, setAuthorList] = useState(defaultAuthorList)
    const [title, setTitle] = useState(defaultTitle)
    const [titleList, setTitleList] = useState(defaultTitleList)

    const [snackOpen, setSnackOpen] = useState(false)
    const [snackSeverity, setSnackSeverity] = useState("info")
    const [snackMessage, setSnackMessage] = useState()

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

    function toast(message, severity) {
        setSnackMessage(message)
        setSnackSeverity(severity)
        setSnackOpen(true)
    }

    const handleSnackClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setSnackOpen(false);
    };

    useEffect( () => {
        async function fetchAuthorsAndTitles(url) {
            const authorURL = url + '/author'
            let response = await fetch(authorURL)
            const authorJSON = await response.json()
            const authors = authorJSON.authors

            // fetch all the new poems before triggering an author / title change
            for (const author of authors) {
                const poemsByAuthorURL = `${url}/author/${encodeURIComponent(author.trim())}`
                response = await fetch(poemsByAuthorURL)
                let fetchedPoemsInitial = await response.json()
                titlesByAuthor = titlesByAuthor ? titlesByAuthor : {}
                titlesByAuthor[author] = []
                fetchedPoems = fetchedPoems ? fetchedPoems : {}
                fetchedPoems[author] = {}
                for (let poem of fetchedPoemsInitial) {
                    titlesByAuthor[author].push(poem.title)
                    fetchedPoems[author][poem.title] = poem.lines
                }
            }

            if (authors.length === 0) return

            // Choose the 2nd poet just because we want it to be Emily Dickinson in our common case
            // or 1st (0th) if we end up with a one poet list
            const authorIndex = Math.min(1, authors.length-1) 

            // Set titles first because it is reverse order of triggering updates to selectors
            const titles = titlesByAuthor[authors[authorIndex]]
            setTitleList(titles)

            setAuthorList(authors)
            setAuthor(authors[authorIndex])
        }
        for (const url of poetryURLs) {
            fetchAuthorsAndTitles(url)
                .catch( (error) => toast(`${error.message}: ${url}`, "warning")); 
        }
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

    // initialize data with defaults
    fetchedPoems = sonnets

  return (
    <section>
        <Grid container spacing={2} direction={extraLargeScreen?"row":"column"}>
            <Grid item xs={6}>
                <h1> Select a poem </h1>
              { authorSelector() }
              { titleSelector() }
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
      <Snackbar open={snackOpen} autoHideDuration={6000} onClose={handleSnackClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={handleSnackClose} severity={snackSeverity} sx={{ width: '100%' }}>
          {snackMessage}
        </Alert>
      </Snackbar>
    </section>
  )
    }

export default InputText;
