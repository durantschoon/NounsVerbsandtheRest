import React, { useState, useEffect } from "react";

import InputLabel from "@mui/material/InputLabel";

import ParserSelector from "./ParserSelector";
import WordStats from "./WordStats";

function ParserChallenger({
  authorData,
  authorDataUpdater,
  authorDataApplyFunc,
  parser,
}) {
  const [stats, setStats] = useState({ falsePos: 0, falseNeg: 0 });

  function _drawNounOutlines(aDataClone) {
    aDataClone.recomputeNounOutlines();

    /* These are the expected ways _drawNounOutlines will be called

      1. from the useEffect in this component (when the poem title or parser
         changes) `authorDataUpdater` should start with the current authorData,
         clone it before calling this and set authorData to the clone in the
         usual way.

      2. from a click on a word in the text-output. In this case, there was a
         bound version of an authorData clone (that seems to be the right one to
         use) from the time the click handler was created. Changes to this clone
         are made from authorDataApplyFunc which will be used ultimately to
         update the official authorData state in an ancestor component.

    */
    const stats = {
      falsePos: document.getElementsByClassName("non-noun inverted").length,
      falseNeg: document.getElementsByClassName("noun inverted").length,
    };
    setStats(stats);

    // update the clone before binding it in the click handlers
    aDataClone.updateCurrentStats(stats);
    _addClickHandlersToSpans(aDataClone);
  }
  const drawNounOutlinesUpdater = () => authorDataUpdater(_drawNounOutlines);

  // changing the poem (lines) or parser will trigger redrawing of noun outlines
  useEffect(drawNounOutlinesUpdater, [
    authorData.currentPoem.title,
    authorData.currentParser.name,
  ]);

  function _invertNoun(aDataClone, line, word) {
    aDataClone.nounInverter.flip(line, word);
    _drawNounOutlines(aDataClone);
  }
  const applyInvertNouns = (aDataClone, line, word) =>
    authorDataApplyFunc(aDataClone, _invertNoun, [line, word]);

  // clicking on a word should also trigger redrawing of noun outlines
  function _addClickHandlersToSpans(aDataClone) {
    const classNames = ["noun", "non-noun"];
    for (let className of classNames) {
      const spans = document.getElementsByClassName(className);
      for (let span of spans) {
        span.addEventListener("click", (event) => {
          event.stopPropagation();
          const [line, word] = event.target.id.split("_").slice(1);
          applyInvertNouns(aDataClone, +line, +word);
        });
      }
    }
  }

  return (
    <>
      <ParserSelector
        {...{ authorDataUpdater, parserName: authorData.currentParser.name }}
      />

      <h1> Correct what is and is not a noun </h1>
      <ul>
        <li>
          Click on a word with the <span className="non-noun">Plus</span>{" "}
          <img id="non-noun-cursor-img"></img> cursor to change a word INTO a
          noun.
        </li>
        <li>
          Click on a word with the <span className="noun">Back</span>{" "}
          <img id="noun-cursor-img"></img> cursor to change a word BACK TO a
          non-noun.
        </li>
      </ul>
      <div id="text-output"></div>

      <WordStats
        {...{
          parserName: parser.name,
          falsePositiveCount: stats.falsePos,
          falseNegativeCount: stats.falseNeg,
        }}
      />
    </>
  );
}

export default ParserChallenger;
