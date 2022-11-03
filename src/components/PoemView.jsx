// import PropTypes from 'prop-types';
import {useState, useEffect} from 'react'
import * as R from 'ramda'

import { Grid } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';

import "./PoemView.css";

import AuthorData, {defaultAuthorData} from '../dataClasses/AuthorData'
import NounInverter, {NounInverterMap} from '../dataClasses/NounInverter'
import PoemSelector from './PoemSelector'
import ParserChallenger from './ParserChallenger'
import {parsers, defaultParser} from '../dataClasses/Parser'
import Poem from '../dataClasses/Poem'
import SnackbarAlerts from './SnackbarAlerts'
import sonnets, {
    defaultAuthorNames,
    defaultTitlesByAuthor} from '../data/sonnets'

// Consider merging these three data structures into one:

// valid keys of fetchedPoems are 'default', 'current' or a URL from poetryURLs
let fetchedPoems = {default: sonnets, current: sonnets}
// valid keys of authorNames are 'default', 'current' or a URL from poetryURLs
let authorNames = {default: defaultAuthorNames, current: defaultAuthorNames}
let titlesByAuthorClone = R.clone(defaultTitlesByAuthor)
// valid keys of titlesByAuthor are 'default', 'current' or a URL from poetryURLs
let titlesByAuthor = {default: titlesByAuthorClone, current: titlesByAuthorClone}

// debug
// const poetryURLs = ['https://poetrydb.org', 'http://165.227.95.56:3000']
// const poetryURLs = ['http://fetch-should-fail.com', 'http://165.227.95.56:3000']
const poetryURLs = []

function PoemView(props) {
    const [parser, setParser] = useState(defaultParser)
    const [authorData, setAuthorData] = useState(defaultAuthorData)

    const [toast, setToast] = useState({open: false, severity: "info", message: ""})
    const [loadingProgress, setLoadingProgress] = useState({authorName: "", percentage: 0})

    const extraLargeScreen = useMediaQuery(theme => theme.breakpoints.up('xl'));

    function setSnackOpen(openOrClosed) {
        setToast( prevToast => ({...prevToast, open: openOrClosed}) )
    }

    /* Update approach:
      - Clones current authorData
      - calls func with the clone and args which is expected to modify the clone
      - sets the new author data to the modified clone

      See the pattern below where method names ending in "Updater", wrap a function with
      authorDataUpdater.
     */
    function authorDataUpdater(func, args) {
        var aDataClone = R.clone(authorData) // deep copy
        func(aDataClone, ...(args ?? []))
        setAuthorData(aDataClone)
    }

    function handleParserChange(event) {
        authorDataUpdater((aDataClone) => {
            aDataClone.currentParser = event.target.value
        })
    }

    function toastAlert(message, severity) {
        setToast({message, severity, open: true})
    }

    /* setHighestRankFetchedPoems Update the fetched poems to the "best" results
      - sets the value of fetchedPoems 'current' key to the first-most URL of poetryURLs
      - calls setAuthorData on the latest data
      */
    function setHighestRankFetchedPoems() {
        for (let url of poetryURLs) {
            if (Object.keys(fetchedPoems[url]).length > 0) {
                console.log(">>> Setting current fetched poem to those from", url)
                fetchedPoems['current'] = fetchedPoems[url]
                authorNames['current'] = authorNames[url]
                titlesByAuthor['current'] = titlesByAuthor[url]
            }
        }
        // Choose the 2nd poet just because we want it to be
        // Emily Dickinson if the vanilla poemdb server comes up.
        // But set it to 0th if we end up with only one poet
        const authorIndex = Math.min(1, authorNames['current'].length-1)
        const author = authorNames['current'][authorIndex]

        const titles = titlesByAuthor['current'][author]
        const title = titles[0]
        const lines = fetchedPoems['current'][author][title]

        const currentPoem = new Poem(author, title, lines)

        setAuthorData({
            name: author,
            titles: titles,
            authorNames: authorNames['current'],
            currentPoem,
            currentParser: parser,
        })
    }

    useEffect( () => {
        console.log("BEGIN useEffect 1")
        async function fetchPoems(url) {
            const authorURL = url + '/author'
            let response = await fetch(authorURL)
            const authorJSON = await response.json()
            const numAuthors = authorNames.length
            let countAuthors = 0

            authorNames[url] = authorJSON.authors
            if (authorNames[url].length === 0) {
                throw `No authors found at ${authorURL}`
            }

            // fetch all the new poems before triggering an author / title change
            for (let authorName of authorNames[url]) {
                let poemsByAuthorURL =
                    `${url}/author/${encodeURIComponent(authorName.trim())}`
                setLoadingProgress({authorName,
                                    percentage: 100 * (++countAuthors / numAuthors)})

                response = await fetch(poemsByAuthorURL)
                let fetchedPoemsInitial = await response.json()

                titlesByAuthor['current'][authorName] = []
                fetchedPoems[url] = fetchedPoems[url] ?? {}
                fetchedPoems[url][authorName] = {}
                for (let poem of fetchedPoemsInitial) {
                    titlesByAuthor['current'][authorName].push(poem.title)
                    fetchedPoems[url][authorName][poem.title] = poem.lines
                }
            }
        }
        const fetchedPromises = poetryURLs.map( url => {
            fetchPoems(url)
                .catch( (error) => toastAlert(`${error.message}: ${url}`, "warning"))
                .then()
        })
        Promise.all(fetchedPromises)
        setHighestRankFetchedPoems()
        console.log("END useEffect 1")
    }, [])

    // When the title changes, update the lines
    useEffect( () => {
        console.log("BEGIN useEffect 2: authorData.currentPoem.title")
        const author = authorData.name
        const title = authorData.currentPoem?.title
        console.log(`      useEffect 2: `, {authorData})
        console.log(`      useEffect 2: `, {fetchedPoems})
        console.log(`      useEffect 2: `, fetchedPoems?.['current']?.[author]?.[title])
        if ( ! fetchedPoems?.['current']?.[author]?.[title] ) return

        console.log(`      useEffect 2: fetchedPoems['current'][${author}][${title}] ${fetchedPoems['current'][author][title]}`)
        const lines = fetchedPoems['current'][author][title] // <-- changing
        authorDataUpdater((aDataClone) => {
            aDataClone.currentPoem = new Poem(author, title, lines)
        })
        console.log("END useEffect 2: authorData.currentPoem.title")
    }, [authorData.currentPoem.title] )

    // When the author name changes, set the current title to the first one fetched
    useEffect( () => {
        console.log("BEGIN useEffect 3: authorData.name")
        const author = authorData.name
        const title = titlesByAuthor['current']?.[author]?.[0] // <-- changing
        console.log(`      useEffect 3: `, {authorData})
        console.log(`      useEffect 3: `, {fetchedPoems})
        console.log(`      useEffect 3: `, fetchedPoems?.['current']?.[author]?.[title])
        if ( ! fetchedPoems?.['current']?.[author]?.[title] ) return

        console.log(`      useEffect 3: fetchedPoems['current'][${author}][${title}] ${fetchedPoems['current'][author][title]}`)
        const lines = fetchedPoems['current'][author][title]   // <-- changing
        authorDataUpdater((aDataClone) => {
            aDataClone.currentPoem = new Poem(author, title, lines)
        })
        console.log("END useEffect 3: authorData.name")
    }, [authorData.name])

    return (
        <section>
          <Grid container spacing={2} direction={extraLargeScreen?"row":"column"}>
            <Grid item xs={6}>
              { authorData?.currentPoem && 
                <PoemSelector {...{authorData, authorDataUpdater, loadingProgress}} />
              }
            </Grid>
            <Grid item xs={6}>
              <ParserChallenger {...{authorData, authorDataUpdater, parser}}/>
            </Grid>
          </Grid>
          <SnackbarAlerts {...{...toast, setSnackOpen}}/>
        </section>
    )
}

export default PoemView;
