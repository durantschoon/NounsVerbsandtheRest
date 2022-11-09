import React, { useEffect } from "react";

import InputLabel from "@mui/material/InputLabel";

import ParserSelector from "./ParserSelector";
import WordStats from "./WordStats";

function ParserChallenger({ authorData, authorDataUpdater, parser }) {
  function _drawNounOutlines(aDataClone) {
    aDataClone.recomputeNounOutlinesHTML();
    const stats = {
      falsePos: document.getElementsByClassName("non-noun inverted").length,
      falseNeg: document.getElementsByClassName("non-noun inverted").length,
    };
    aDataClone.updateCurrentStats(stats);
    addClickHandlersToSpans();
  }
  const drawNounOutlinesUpdater = () => authorDataUpdater(_drawNounOutlines);

  function _invertNoun(aDataClone, line, word) {
    console.log(`flipping line ${line} word ${word}`);
    aDataClone.getNounInverter().flip(line, word);
    _drawNounOutlines(aDataClone);
  }
  const invertNounUpdater = (line, word) =>
    authorDataUpdater(_invertNoun, [line, word]);
  // changing the poem (lines) or parser will trigger redrawing of noun outlines
  useEffect(drawNounOutlinesUpdater, [
    authorData.currentPoem.title,
    authorData.currentParser.name,
  ]);

  // clicking on a word should also trigger redrawing of noun outlines
  function addClickHandlersToSpans() {
    const classNames = ["noun", "non-noun"];
    for (let className of classNames) {
      const spans = document.getElementsByClassName(className);
      for (let span of spans) {
        span.addEventListener("click", (event) => {
          event.stopPropagation();
          const [line, word] = event.target.id.split("_").slice(1);
          console.log(`clicking at line ${line} word ${word}`);
          invertNounUpdater(+line, +word);
        });
      }
    }
  }

  console.log("in ParserChallenger");

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
          falsePositiveCount: authorData.getNounInverter().falsePositiveCount,
          falseNegativeCount: authorData.getNounInverter().falseNegativeCount,
        }}
      />
    </>
  );
}

export default ParserChallenger;
