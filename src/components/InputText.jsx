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

import "./PoemView.css";

import NounInverter, {NounInverterMap} from '../dataClasses/NounInverter'
import PoemSelector from './PoemSelector'
import ParserChallenger from './Par'
import ParserDescriptions from './ParserDescriptions'
import {parsers, defaultParser} from '../dataClasses/Parser'
import {Poem, defaultPoem} from '../dataClasses/Poem'
import SnackbarAlerts from './SnackbarAlerts'
import sonnets, {
    defaultAuthorNames,
    defaultTitles,
    defaultTitlesByAuthor } from '../data/sonnets'

// fetchedPoems holds the actual lines of the poems
let fetchedPoems = sonnets
let titlesByAuthor = R.clone(defaultTitlesByAuthor)

// debug
// const poetryURLs = ['https://poetrydb.org', 'http://165.227.95.56:3000']
// const poetryURLs = ['http://fetch-should-fail.com', 'http://165.227.95.56:3000']
const poetryURLs = []

const punct = /([.,\/#!$%\^&\*;:{}=\-_`~()]+)/gm
const spacePunct = /([\s.,\/#!$%\^&\*;:{}=\-_`~()]+)/gm
const UNICODE_NBSP = "\u00A0"

function PoemView(props) {
    const [parser, setParser] = useState(defaultParser)
    const [authorData, setAuthorData] = useState(new AuthorData({
        name: defaultAuthorName,
        titles: defaultTitles,
        authorNames: defaultAuthorNames,
        currentPoem: defaultPoem,
        currentParser: defaultParser,
        // nounInverters should be updated when there are new text lines of a poem
        nounInverters: new NounInverterMap(defaultParser.name,
                                           defaultPoem.author,
                                           defaultPoem.title,
                                           new NounInverter(defaultTextLines))}))
    const [toast, setToast] = useState({open: false, severity: "info", message: ""})
    const [loadingProgress, setLoadingProgress] = useState({authorName: "", percentage: 0})

    const extraLargeScreen = useMediaQuery(theme => theme.breakpoints.up('xl'));

    function setSnackOpen(openOrClosed) {
        setToast( prevToast => ({...prevToast, open: openOrClosed}) )
    }

    function toastAlert(message, severity) {
        setToast({message, severity, open: true})
    }

    /*
      Clone authorData as aDataClone and run func with args.
      The cloned variable aDataClone is intended to be accessed and mutated by func
      Finally, use the modified clone to set the author data.
      */
    function authorDataUpdater(func, args) {
        let aDataClone = R.clone(authorData) // deep copy
        func(...args)
        setAuthorData(aDataClone)
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
                let poemsByAuthorURL = `${url}/author/${encodeURIComponent(authorName.trim())}`
                setLoadingProgress({authorName, percentage: 100 * (++countAuthors / numAuthors)})

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
            // Emily Dickinson if the vanilla PoemDB server connects
            // But set index to 0 if we fetch from a source with only one poet
            const authorIndex = Math.min(1, authorNames.length-1)

            const author = authorNames[authorIndex]
            const titles = titlesByAuthor[author]
            const title = titles[0]
            const lines = fetchedPoems[author][title]

            const currentPoem = new Poem(author, title, lines)

            setAuthorData({
                name: author,
                titles,
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

    // When the title changes, the entire poem changes
    useEffect( () => {
        setAuthorData( prevAuthor => {
            if (prevAuthor.currentTitle !== authorData.currentTitle) {
                // reset the noun inverter so this it will be reconstructed for the current parser
                updateValueForCurrentParser(setNounInverters, [])
            }
            return {...prevAuthor, currentLines: fetchedPoems[authorData.name][authorData.currentTitle]}
        })
    }, [authorData.currentTitle] )

    // When the author changes, set the current poem to the first one for the poet
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

    return (
        <section>
          <Grid container spacing={2} direction={extraLargeScreen?"row":"column"}>
            <Grid item xs={6}>
              <PoemSelector {...{authorData, authorDataUpdater, loadingProgress}} />
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
