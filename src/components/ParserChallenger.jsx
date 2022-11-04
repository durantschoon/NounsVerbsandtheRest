import React, { useEffect } from "react";

import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import InputLabel from "@mui/material/InputLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";

import ParserDescriptions from "./ParserDescriptions";
import { parsers, defaultParser } from "../dataClasses/Parser";

function ParserChallenger({ authorData, authorDataUpdater, parser }) {
  function _drawNounOutlines(aDataClone) {
    document.getElementById("text-output").innerHTML =
      aDataClone.getTaggedWordsHTML();
    const stats = {
      falsePos: document.getElementsByClassName("non-noun inverted").length,
      falseNeg: document.getElementsByClassName("non-noun inverted").length,
    };
    aDataClone.updateCurrentStats(stats);
    addClickHandlersToSpans();
  }
  const drawNounOutlinesUpdater = () => authorDataUpdater(_drawNounOutlines);

  function _invertNoun(aDataClone, line, word) {
    aDataClone.getNounInverter().flip(aDataClone, line, word);
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
          invertNounUpdater(parseInt(line, 10), parseInt(word, 10));
        });
      }
    }
  }

  function handleParserChange(event) {
    authorDataUpdater((aDataClone) => {
      aDataClone.currentParser = parsersByName[event.target.value];
    });
  }

  const falsePositiveCount = parser.nounInverter.falsePositiveCount;
  const falseNegativeCount = parser.nounInverter.falseNegativeCount;

  return (
    <>
      <h1> Choose your Natural Language Parser </h1>
      <div>
        <ParserDescriptions />
        <FormControl>
          <FormLabel id="parsers-radio-buttons-group-label">Parsers</FormLabel>
          <RadioGroup
            row
            aria-labelledby="parsers-radio-buttons-group-label"
            defaultValue={defaultParser.name}
            name="parserName"
            value={defaultParser.name}
            onChange={handleParserChange}
          >
            <FormControlLabel
              value="parts-of-speech"
              control={<Radio />}
              label="Parts-of-Speech"
            />
            <FormControlLabel
              value="en-pos"
              control={<Radio />}
              label="en-pos"
            />
          </RadioGroup>
        </FormControl>
      </div>
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
      <fieldset id="stats-fieldset">
        <legend id="stats-legend">
          <b>
            <i>Statistics for {parser.name}</i>
          </b>
        </legend>
        <div>
          <span>
            <b>False Positives:</b> {falsePositiveCount}{" "}
          </span>
          <span>
            <b>False Negatives:</b> {falseNegativeCount}
          </span>
        </div>
        <b>Total Incorrect:</b> {falsePositiveCount + falseNegativeCount}
      </fieldset>
    </>
  );
}

export default ParserChallenger;
