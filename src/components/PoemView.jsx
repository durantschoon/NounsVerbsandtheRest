// import PropTypes from 'prop-types';
import { useState, useEffect } from "react";
import * as R from "ramda";

import { Grid } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";

import "./PoemView.css";

import PoemSelector from "./PoemSelector";
import ParserChallenger from "./ParserChallenger";
import SnackbarAlerts from "./SnackbarAlerts";

import AuthorData, { defaultAuthorData } from "../dataClasses/AuthorData";
import NounInverter, { NounInverterMap } from "../dataClasses/NounInverter";
import { parsers, parsersByName, defaultParser } from "../dataClasses/Parser";
import Poem from "../dataClasses/Poem";
import sonnets, {
  defaultAuthorNames,
  defaultTitlesByAuthor,
} from "../data/sonnets";

// Consider merging these three data structures into one:

// valid keys of fetchedPoems are 'default', 'current' or a URL from poetryURLs
let fetchedPoems = { default: sonnets, current: sonnets };
// valid keys of authorNames are 'default', 'current' or a URL from poetryURLs
let authorNames = { default: defaultAuthorNames, current: defaultAuthorNames };
let titlesByAuthorClone = R.clone(defaultTitlesByAuthor);
// valid keys of titlesByAuthor are 'default', 'current' or a URL from poetryURLs
let titlesByAuthor = {
  default: titlesByAuthorClone,
  current: titlesByAuthorClone,
};

// order poetry urls best to worst (highest priority first)
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

  /* Update approach:
      - Clones current authorData
      - Calls func with the clone and args which is expected to modify the clone
      - Sets the new author data to the modified clone

      See the pattern below where method names ending in "Updater", wrap a function with
      authorDataUpdater.
    */
  function authorDataUpdater(func, args) {
    var aDataClone = R.clone(authorData); // deep copy
    // this is a fix for a currently unexplained phenomenon
    if (!("getTaggedWordsHTML" in aDataClone)) {
      let data = {
        name: aDataClone.name,
        titles: aDataClone.titles,
        authorNames: aDataClone.authorNames,
        currentPoem: aDataClone.currentPoem,
        currentParser: aDataClone.currentParser,
      };
      aDataClone = new AuthorData(data);
    }
    func(aDataClone, ...(args ?? []));
    setAuthorData(aDataClone);
  }

  function handleParserChange(event) {
    authorDataUpdater((aDataClone) => {
      aDataClone.currentParser = parsersByName[event.target.value];
    });
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
    // Choose the 2nd poet just because we want it to be
    // Emily Dickinson if the vanilla poemdb server comes up.
    // But set it to 0th if we end up with only one poet
    const authorIndex = Math.min(1, authorNames["current"].length - 1);
    const author = authorNames["current"][authorIndex];

    const titles = titlesByAuthor["current"][author];
    const title = titles[0];
    const lines = fetchedPoems["current"][author][title];

    const currentPoem = new Poem(author, title, lines);

    // infinite loop still occurs when this whole block is commented out

    if (fetchedPoems["current"] !== fetchedPoems["default"]) {
      setAuthorData({
        name: author,
        titles: titles,
        authorNames: authorNames["current"],
        currentPoem,
        currentParser: parser,
      });
    }
  }

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

  // When the title changes, update the lines
  useEffect(() => {
    const author = authorData.name;
    const title = authorData.currentPoem?.title;
    // needed?
    // if (!fetchedPoems?.["current"]?.[author]?.[title]) return;

    const newLines = fetchedPoems["current"][author][title];

    authorDataUpdater((aDataClone) => {
      aDataClone.setPoem(new Poem(author, title, newLines));
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
      aDataClone.setPoem(new Poem(author, newTitle, newLines));
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
          <ParserChallenger {...{ authorData, authorDataUpdater, parser }} />
        </Grid>
      </Grid>
      <SnackbarAlerts {...{ ...toast, setSnackOpen }} />
    </section>
  );
}

export default PoemView;
