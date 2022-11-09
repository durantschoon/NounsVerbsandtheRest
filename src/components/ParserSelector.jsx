import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";

import ParserDescriptions from "./ParserDescriptions";
import { defaultParser, parsersByName } from "../dataClasses/Parser";

function ParserSelector({ authorDataUpdater, parserName }) {
  function handleParserChange(event) {
    authorDataUpdater((aDataClone) => {
      aDataClone.setParser(parsersByName[event.target.value]);
    });
  }

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
            /* value={defaultParser.name} */
            value={parserName}
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
    </>
  );
}

export default ParserSelector;
