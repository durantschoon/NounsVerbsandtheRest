// import PropTypes from 'prop-types';
import React, { useState, useEffect } from "react";
import * as R from "ramda";
import z from "zod";

import { Grid, Theme } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";

import PoemSelector from "./PoemSelector";
import ParserChallenger from "./ParserChallenger";
import SnackbarAlerts from "./SnackbarAlerts";

import {
  AuthorClone,
  AuthorCloneUpdatorType,
  AuthorCloneUpdatorWithWordType,
  AuthorCloneApplyWordFuncType,
  AuthorName,
  AuthorUpdatorType,
  ChangeEvent,
  LoadingProgress,
  PoemsByAuthor } from "src/type-definitions";

import Author, { defaultAuthor } from "../dataClasses/Author";
import { parsersByName, defaultParser } from "../dataClasses/Parser";
import Poem from "../dataClasses/Poem";
import sonnets, {
  defaultAuthorNames,
  defaultTitlesByAuthor,
} from "../data/sonnets";

import "./PoemView.css";
import { AssessmentRounded } from "@mui/icons-material";

// Order poetry urls "best" to "worst" (highest priority first)
// Define as an enum so that we can create a types later
// const PoetryURLs = z.enum([
//   "http://fetch-should-fail.com",
//   "http://165.227.95.56:3000",
// ]);
// debug values
// const PoetryURLs = z.enum(["https://poetrydb.org", "http://165.227.95.56:3000"]);
const poetryURLs = ["https://poetrydb.org", "http://165.227.95.56:3000"]

const zurl = z.string().url();
type PoetryURL = z.infer<typeof zurl>

/* For the following data structures with these keys being valid
   'default', 'current' or a URL from poetryURLs
   - 'current' initially points to the 'default' entry, but after
     poems are fetched, 'current' will point the "best" values fetched from a url.
     See PoetryURLs for definition of "best"
  */

type FetchedAuthorDataSemantic = { default: PoemsByAuthor, current: PoemsByAuthor }
type FetchedAuthorDataURL = { [P in PoetryURL]?: PoemsByAuthor }
type FetchedAuthorData = FetchedAuthorDataSemantic & FetchedAuthorDataURL

let fetchedAuthorData: FetchedAuthorData = { default: sonnets, current: sonnets };

type FetchedAuthorNamesSemantic = { default: AuthorName[], current: AuthorName[] }
type FetchedAuthorNamesURL = { [P in PoetryURL]?: AuthorName[] }
type FetchedAuthorNames = FetchedAuthorNamesSemantic & FetchedAuthorNamesURL

let authorNames: FetchedAuthorNames = { default: defaultAuthorNames, current: defaultAuthorNames };

type AuthorTitles = { [author: string]: string[] }
type FetchedTitlesByAuthorSemantic = { default: AuthorTitles, current: AuthorTitles }
type FetchedTitlesByAuthorURL = { [P in PoetryURL]?: AuthorTitles }
type FetchedTitlesByAuthor = FetchedTitlesByAuthorSemantic & FetchedTitlesByAuthorURL

let titlesByAuthorClone = R.clone(defaultTitlesByAuthor);
let titlesByAuthor: FetchedTitlesByAuthor = {
  default: titlesByAuthorClone,
  current: titlesByAuthorClone,
}

function PoemView() {
  // TODO: if the parser is on the author, do we need this separate state?
  const [parser, setParser] = useState(defaultParser);
  const [author, setAuthor] = useState(defaultAuthor as Author);

  const [toast, setToast] = useState({
    open: false,
    severity: "info",
    message: "",
  });
  const [loadingProgress, setLoadingProgress] = useState({
    authorName: "",
    percentage: 0,
  } as LoadingProgress);

  const extraLargeScreen = useMediaQuery<Theme>((theme: Theme) => theme.breakpoints.up("xl"));

  function setSnackOpen(openOrClosed: boolean) {
    setToast((prevToast) => ({ ...prevToast, open: openOrClosed }));
  }

  function toastAlert(message: string, severity: string) {
    setToast({ message, severity, open: true });
  }

  /* setHighestRankFetchedPoem Update the fetched poems to the "best" results
      - sets the value of fetchedPoems 'current' key to the first-most URL of poetryURLs
      - calls setAuthorData on the latest data
    */
  function setHighestRankFetchedPoem() {
    for (let url of poetryURLs) {
      const poems = fetchedAuthorData[url]!;
      if (Object.keys(poems).length > 0) {
        fetchedAuthorData.current = fetchedAuthorData[url]!;
        authorNames.current = authorNames[url]!;
        titlesByAuthor.current = titlesByAuthor[url]!;
        break;
      }
    }
    if (fetchedAuthorData.current !== fetchedAuthorData.default) {
      // Choose the 2nd poet just because we want it to be
      // Emily Dickinson if the vanilla poemdb server comes up.
      // But set it to 0th if we end up with only one poet
      // because some other data has loaded.
      const authorIndex = Math.min(1, authorNames.current.length - 1);
      const author = authorNames.current[authorIndex];

      const titles = titlesByAuthor.current[author];
      const title = titles[0];
      const lines = fetchedAuthorData.current.currentPoem.lines;

      const currentPoem = new Poem(author, title, lines);

      setAuthor(
        new Author({
          name: author,
          titles: titles,
          authorNames: authorNames.current,
          currentPoem,
          currentParser: parser,
        })
      );
    }
  }

  /* Updating:
      - Chain together any number of functions that will modify the authorData
        and pass those into authorUpdater
      - Clones current authorData
      - Applies (chained) func(s) to modify clone (with any args)
      - Finally, sets the new author state to the modified clone
    */
  const authorUpdater: AuthorUpdatorType = 
  (func: AuthorCloneUpdatorType, args?: any[]) => {
    var clone = R.clone(author); // deep copy for modification and resetting    
    func(clone, ...(args ?? []));
    setAuthor(clone);
  }

  const authorApplyWordFunc: AuthorCloneApplyWordFuncType = 
  (clone: AuthorClone, func: AuthorCloneUpdatorWithWordType, line: number, word: number) => {
    func(clone, line, word);
    setAuthor(clone);
  }

  // Initial useEffect hook tries to fetch poems from URLs
  useEffect(() => {
    async function fetchPoems(url: string) {
      const authorURL = url + "/author";
      let response = await fetch(authorURL);
      const authorJSON = await response.json();

      const numAuthors = authorNames.current.length;
      let countAuthors = 0;

      authorNames[url] = authorJSON.authors;
      if (authorNames[url]?.length === 0) {
        throw `No authors found at ${authorURL}`;  
      }
      
      // fetch all the new poems before triggering an author / title change
      for (let authorName of authorNames[url]!) {
        let poemsByAuthorURL = `${url}/author/${encodeURIComponent(
          authorName.trim()
        )}`;
        setLoadingProgress({
          authorName,
          percentage: 100 * (++countAuthors / numAuthors),
        });

        response = await fetch(poemsByAuthorURL);
        let fetchedPoemsInitial = await response.json();

        if (titlesByAuthor[url]) {
          titlesByAuthor[url]![authorName] = [];
        } else {
          titlesByAuthor[url] = { [authorName]: [] };
        }
        if (fetchedAuthorData[url]) {
          fetchedAuthorData[url]![authorName] = {};
        } else {
          fetchedAuthorData[url] = { [authorName]: {} };
        }
        for (let poem of fetchedPoemsInitial) {
          titlesByAuthor[url]![authorName].push(poem.title);
          fetchedAuthorData[url]?[authorName][poem.title] = poem.lines;
        }
      }
    }
    const fetchedPromises = poetryURLs.map(async (url: PoetryURL) => {
      try {
        return await fetchPoems(url);
      } catch (error: Error) {
        return toastAlert(`${error.message}: ${url}`, "warning");
      }
    });
    Promise.all(fetchedPromises).then(() => setHighestRankFetchedPoem());
  }, []);

  // When the title changes, update the lines of poetry
  useEffect(() => {
    const authorName: AuthorName = author.name;
    const title = author.stagedTitleChange;

    const newLines = fetchedAuthorData.current[authorName][title];

    authorUpdater((aDataClone) => {
      aDataClone.setPoem(new Poem(authorName, title, newLines));
    });
  }, [author.stagedTitleChange]);

  // When the author name changes, set the current title to the first one fetched
  useEffect(() => {
    const authorName = author.name;
    const newTitle = titlesByAuthor.current?.[authorName]?.[0];
    // needed?
    // if (!fetchedPoems?.["current"]?.[authorName]?.[newTitle]) return;
    const newLines = fetchedAuthorData.current[authorName][newTitle];

    authorUpdater((authorClone: AuthorClone) => {
      // update the possible titles, so the selector will populate before the
      // poem resets
      authorClone.titles = titlesByAuthor.current[authorClone.name];
      authorClone.setPoem(new Poem(authorName, newTitle, newLines));
    });
  }, [author.name]);

  return (
    <section>
      <Grid
        container
        spacing={2}
        direction={extraLargeScreen ? "row" : "column"}
      >
        <Grid item xs={6}>
          {author?.currentPoem && (
            <PoemSelector {...{ author, authorUpdater, loadingProgress }}
            />
          )}
        </Grid>
        <Grid item xs={6}>
          <ParserChallenger {...{ author, authorUpdater, authorApplyWordFunc, parser }}/>
        </Grid>
      </Grid>
      <SnackbarAlerts {...{ ...toast, setSnackOpen }} />
    </section>
  );
}

export default PoemView;
