import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";

import { 
  AuthorClone, 
  AuthorUpdatorType,
  ChangeEvent 
} from "../type-definitions.d";

import ParserDescriptions from "./ParserDescriptions";
import { defaultParser, parsersByName } from "../dataClasses/Parser";

type Props = { 
  authorUpdater: AuthorUpdatorType, 
  parserName: string 
}

function ParserSelector({authorUpdater, parserName} : Props) {
  // function handleParserChange(event: ChangeEvent) {
  function handleParserChange(event: any) {
    authorUpdater((clone: AuthorClone) => {
      clone.currentParser = parsersByName[event.target.value];
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
