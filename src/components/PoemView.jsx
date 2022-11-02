// import PropTypes from 'prop-types';
import {useState, useEffect} from 'react'
import * as R from 'ramda'

import { Grid } from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import InputLabel from '@mui/material/InputLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import useMediaQuery from '@mui/material/useMediaQuery';

import "./InputText.css";

import NounInverter, {NounInverterMap} from '../dataClasses/NounInverter'
import PoemSelector from './PoemSelector'
import ParserDescriptions from './ParserDescriptions'
import {parsers, defaultParser} from '../dataClasses/Parser'
import {Poem, defaultPoem} from '../dataClasses/Poem'
import SnackbarAlerts from './SnackbarAlerts'
import sonnets as fetchedPoems, {
    defaultAuthorNames,
    defaultTitles,
    defaultTitlesByAuthor } from '../data/sonnets'

let titlesByAuthor = R.clone(defaultTitlesByAuthor)

// debug
// const poetryURLs = ['https://poetrydb.org', 'http://165.227.95.56:3000']
// const poetryURLs = ['http://fetch-should-fail.com', 'http://165.227.95.56:3000']
const poetryURLs = []

function InputText(props) {
    const [parser, setParser] = useState(defaultParser)
    const [authorData, setAuthorData] = useState(new AuthorData({
        name: defaultAuthorName,
        titles: defaultTitles,
        authorNames: defaultAuthorNames,
        currentPoem: defaultPoem,
        currentParser: defaultParser)})
    const [toast, setToast] = useState({open: false, severity: "info", message: ""})
    const [loadingProgress, setLoadingProgress] = useState({authorName: "", percentage: 0})

    const extraLargeScreen = useMediaQuery(theme => theme.breakpoints.up('xl'));

    function setSnackOpen(openOrClosed) {
        setToast( prevToast => ({...prevToast, open: openOrClosed}) )
    }

    /* Update approach:
      - Clones current authorData
      - calls func with args, intending func to access and modify aDataClone by name in scope
      - sets the new author data to the modified clone

      See the pattern below where method names ending in "Updater", wrap a function with
      authorDataUpdater.
     */
    function authorDataUpdater(func, args) {
        let aDataClone = R.clone(authorData) // deep copy
        func(...args)
        setAuthorData(aDataClone)
    }

    // access and mutate aDataClone from calling scope authorDataUpdater
    function _drawNounOutlines() {
        document.getElementById("text-output").innerHTML = aDataClone.getTaggedWordsHTML()
        stats = {
            falsePos: document.getElementsByClassName("non-noun inverted").length,
            falseNeg: document.getElementsByClassName("non-noun inverted").length
        }
        aDataClone.updateCurrentStats(stats)
        addClickHandlersToSpans()
    }
    const drawNounOutlinesUpdater = () => authorDataUpdater(_drawNounOutlines)

    // access and mutate aDataClone from calling scope authorDataUpdater
    function _invertNoun(line, word) {
        aDataClone.getNounInverter().flip(line, word)
        _drawNounOutlines() // still modifying the same aDataClone so call this directly
    }
    const invertNounUpdater = (line, word) => authorDataUpdater(_invertNoun, [line, word])

    // changing the poem (lines) or parser will trigger redrawing of noun outlines
    useEffect(drawNounOutlinesUpdater, [authorData.currentLines, authorData.currentParser])

    // clicking on a word should also trigger redrawing of noun outlines
    function addClickHandlersToSpans() {
        const classNames = ['noun', 'non-noun']
        for (let className of classNames) {
            const spans = document.getElementsByClassName(className)
            for (let span of spans) {
                span.addEventListener('click', (event) => {
                    event.stopPropagation()
                    const [line, word] = event.target.id.split('_').slice(1)
                    invertNounUpdater(parseInt(line, 10), parseInt(word, 10))
                })
            }
        }
    }

    function handleParserChange(event) {
        authorDataUpdater(() => { aDataClone.currentParser = event.target.value })
    }

    function toastAlert(message, severity) {
        setToast({message, severity, open: true})
    }

    useEffect( () => {
        async function fetchPoems(url) {
            const authorURL = url + '/author'
            let response = await fetch(authorURL)
            const authorJSON = await response.json()
            const authorNames = authorJSON.authors
            const numAuthors = authorNames.length
            let countAuthors = 0

            if (authorNames.length === 0) {
                throw `No authors found at ${authorURL}`
            }

            // fetch all the new poems before triggering an author / title change
            for (let authorName of authorNames) {
                let poemsByAuthorURL =
                    `${url}/author/${encodeURIComponent(authorName.trim())}`
                setLoadingProgress({authorName,
                                    percentage: 100 * (++countAuthors / numAuthors)})

                response = await fetch(poemsByAuthorURL)
                let fetchedPoemsInitial = await response.json()

                titlesByAuthor = titlesByAuthor ?? {}
                titlesByAuthor[authorName] = []
                fetchedPoems = fetchedPoems ?? {}
                fetchedPoems[authorName] = {}
                for (let poem of fetchedPoemsInitial) {
                    titlesByAuthor[authorName].push(poem.title)
                    fetchedPoems[authorName][poem.title] = poem.lines
                }
            }
            // Choose the 2nd poet just because we want it to be
            // Emily Dickinson if the vanilla poemdb server comes up.
            // But set it to 0th if we end up with only one poet
            const authorIndex = Math.min(1, authorNames.length-1)
            const titles = titlesByAuthor[authorNames[authorIndex]]

            const author = authorNames[authorIndex]
            const title = titles[0]
            const lines = fetchedPoems[author][title]

            const currentPoem = new Poem(author, title, lines)

            setAuthorData({
                name: author,
                titles: titles,
                authorNames,
                currentPoem,
                currentParser: parser,
            })
        }
        let fetchedPromises = poetryURLs.map( url => {
            fetchPoems(url)
                .catch( (error) => toastAlert(`${error.message}: ${url}`, "warning"))
        })
        Promise.all(fetchedPromises)
    }, [])

    useEffect( () => {
        // When the title changes, the entire poem changes
        setAuthorData( prevAuthor => {
            console.log("HERE", {authorData}, fetchedPoems[authorData.name][authorData.currentTitle])
            if (prevAuthor.currentTitle !== authorData.currentTitle) {
                // reset the noun inverter so this it will be reconstructed for the current parser
                updateValueForCurrentParser(setNounInverters, [])
            }
            return {...prevAuthor, currentLines: fetchedPoems[authorData.name][authorData.currentTitle]}
        })
    }, [authorData.currentTitle] )

    useEffect( () => {
        setAuthorData( prevAuthor => {
            const titles = titlesByAuthor[authorData.name]
            return({
                ...prevAuthor,
                titles: titles,
                currentTitle: titles[0],
            })
        })
    }, [authorData.name])

    const poemSelectionCriteria = {authorData, setAuthorData, loadingProgress}

    return (
        <section>
          <Grid container spacing={2} direction={extraLargeScreen?"row":"column"}>
            <Grid item xs={6}>
              <PoemSelector {...poemSelectionCriteria} />
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
