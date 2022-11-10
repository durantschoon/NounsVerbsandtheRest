// import PropTypes from 'prop-types';
import { useState, useEffect } from "react";
import * as R from "ramda";

import { Grid } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";

import PoemSelector from "./PoemSelector";
import ParserChallenger from "./ParserChallenger";
import SnackbarAlerts from "./SnackbarAlerts";

import AuthorData, { defaultAuthorData } from "../dataClasses/AuthorData";
import NounInverter from "../dataClasses/NounInverter";
import { parsers, parsersByName, defaultParser } from "../dataClasses/Parser";
import Poem from "../dataClasses/Poem";
import sonnets, {
  defaultAuthorNames,
  defaultTitlesByAuthor,
} from "../data/sonnets";

import "./PoemView.css";

// Consider merging these three data structures into one:

/* For the following data structures,
   valid keys are 'default', 'current' or a URL from poetryURLs

   - 'current' initially points to the 'default' entry, but after
     poems are fetched, 'current' will point the values from a url.
     For example, after a fetch, fetchedPoems['current'] will be the
     poems fetched from a URL (best from a choice, see below).
  */

let fetchedPoems = { default: sonnets, current: sonnets };
let authorNames = { default: defaultAuthorNames, current: defaultAuthorNames };

let titlesByAuthorClone = R.clone(defaultTitlesByAuthor);
let titlesByAuthor = {
  default: titlesByAuthorClone,
  current: titlesByAuthorClone,
};

// order poetry urls "best" to "worst" (highest priority first)
// debug
// const poetryURLs = ['https://poetrydb.org', 'http://165.227.95.56:3000']
const poetryURLs = [
  "http://fetch-should-fail.com",
  "http://165.227.95.56:3000",
];
/// const poetryURLs = [];

function PoemView(props) {
  const [parser, setParser] = useState(defaultParser);
  const [authorData, setAuthorData] = useState(defaultAuthorData);

  const [toast, setToast] = useState({
    open: false,
    severity: "info",
    message: "",
  });
  const [loadingProgress, setLoadingProgress] = useState({
    authorName: "",
    percentage: 0,
  });

  const extraLargeScreen = useMediaQuery((theme) => theme.breakpoints.up("xl"));

  function setSnackOpen(openOrClosed) {
    setToast((prevToast) => ({ ...prevToast, open: openOrClosed }));
  }

  function toastAlert(message, severity) {
    setToast({ message, severity, open: true });
  }

  /* setHighestRankFetchedPoem Update the fetched poems to the "best" results
      - sets the value of fetchedPoems 'current' key to the first-most URL of poetryURLs
      - calls setAuthorData on the latest data
    */
  function setHighestRankFetchedPoem() {
    for (let url of poetryURLs) {
      if (fetchedPoems[url] && Object.keys(fetchedPoems[url]).length > 0) {
        fetchedPoems["current"] = fetchedPoems[url];
        authorNames["current"] = authorNames[url];
        titlesByAuthor["current"] = titlesByAuthor[url];
        break;
      }
    }
    if (fetchedPoems["current"] !== fetchedPoems["default"]) {
      // Choose the 2nd poet just because we want it to be
      // Emily Dickinson if the vanilla poemdb server comes up.
      // But set it to 0th if we end up with only one poet
      // because some other data has loaded.
      const authorIndex = Math.min(1, authorNames["current"].length - 1);
      const author = authorNames["current"][authorIndex];

      const titles = titlesByAuthor["current"][author];
      const title = titles[0];
      const lines = fetchedPoems["current"][author][title];

      const currentPoem = new Poem(author, title, lines);

      setAuthorData(
        new AuthorData({
          name: author,
          titles: titles,
          authorNames: authorNames["current"],
          currentPoem,
          currentParser: parser,
        })
      );
    }
  }

  /* FIXME TODO

      I think the bug is that there needs to be a separate update path triggered
      from a handler, so I'll make a separate function and factor out the "setting"
      part.

      */

  /* Updating:

      - Clones current authorData

      - Calls func with the clone and any args to func (func is expected to
        modify the clone)

      - Finally, sets the new author data to the modified clone

      See the pattern below where method names ending in "Updater", wrap a function with
      authorDataUpdater.

      There is a separate pattern for calling from a click handler. In that
      case, we don't want to clone but start from a modified state (an existing
      clone that represents the latest updates, not the one bound in
      authorDataUpdater at the time of component creation). The handler version
      should call `authorDataApplyFunc` directly instead.
    */
  function authorDataApplyFunc(aData, func, args) {
    func(aData, ...(args ?? []));
    setAuthorData(aData);
  }
  function authorDataUpdater(func, args) {
    var aDataClone = R.clone(authorData); // deep copy for modification and resetting
    authorDataApplyFunc(aDataClone, func, args);
  }

  function handleParserChange(event) {
    authorDataUpdater((aDataClone) => {
      aDataClone.currentParser = parsersByName[event.target.value];
    });
  }

  // Initial useEffect hook tries to fetch poems from URLs
  useEffect(() => {
    async function fetchPoems(url) {
      const authorURL = url + "/author";
      let response = await fetch(authorURL);
      const authorJSON = await response.json();
      const numAuthors = authorNames["current"].length;
      let countAuthors = 0;

      authorNames[url] = authorJSON.authors;
      if (authorNames[url].length === 0) {
        throw `No authors found at ${authorURL}`;
      }

      // fetch all the new poems before triggering an author / title change
      for (let authorName of authorNames[url]) {
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
          titlesByAuthor[url][authorName] = [];
        } else {
          titlesByAuthor[url] = { [authorName]: [] };
        }
        if (fetchedPoems[url]) {
          fetchedPoems[url][authorName] = {};
        } else {
          fetchedPoems[url] = { [authorName]: {} };
        }
        for (let poem of fetchedPoemsInitial) {
          titlesByAuthor[url][authorName].push(poem.title);
          fetchedPoems[url][authorName][poem.title] = poem.lines;
        }
      }
    }
    const fetchedPromises = poetryURLs.map((url) => {
      return fetchPoems(url).catch((error) =>
        toastAlert(`${error.message}: ${url}`, "warning")
      );
    });
    Promise.all(fetchedPromises).then(() => setHighestRankFetchedPoem());
  }, []);

  // When the title changes, update the lines of poetry text
  useEffect(() => {
    const author = authorData.name;
    const title = authorData.currentPoem.title;
    // needed?
    // if (!fetchedPoems?.["current"]?.[author]?.[title]) return;

    const newLines = fetchedPoems["current"][author][title];

    authorDataUpdater((aDataClone) => {
      aDataClone.poem = new Poem(author, title, newLines);
    });
  }, [authorData.currentPoem.title]);

  // When the author name changes, set the current title to the first one fetched
  useEffect(() => {
    const author = authorData.name;
    const newTitle = titlesByAuthor["current"]?.[author]?.[0];
    // needed?
    // if (!fetchedPoems?.["current"]?.[author]?.[newTitle]) return;
    const newLines = fetchedPoems["current"][author][newTitle];

    authorDataUpdater((aDataClone) => {
      // update the possible titles, so the selector will populate before the
      // poem resets
      aDataClone.titles = titlesByAuthor["current"][aDataClone.name];
      aDataClone.poem = new Poem(author, newTitle, newLines);
    });
  }, [authorData.name]);

  return (
    <section>
      <Grid
        container
        spacing={2}
        direction={extraLargeScreen ? "row" : "column"}
      >
        <Grid item xs={6}>
          {authorData?.currentPoem && (
            <PoemSelector
              {...{ authorData, authorDataUpdater, loadingProgress }}
            />
          )}
        </Grid>
        <Grid item xs={6}>
          <ParserChallenger
            {...{ authorData, authorDataUpdater, authorDataApplyFunc, parser }}
          />
        </Grid>
      </Grid>
      <SnackbarAlerts {...{ ...toast, setSnackOpen }} />
    </section>
  );
}

export default PoemView;
