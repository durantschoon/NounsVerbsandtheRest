"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Radio_1 = __importDefault(require("@mui/material/Radio"));
var RadioGroup_1 = __importDefault(require("@mui/material/RadioGroup"));
var FormControlLabel_1 = __importDefault(require("@mui/material/FormControlLabel"));
var FormControl_1 = __importDefault(require("@mui/material/FormControl"));
var FormLabel_1 = __importDefault(require("@mui/material/FormLabel"));
var ParserDescriptions_1 = __importDefault(require("./ParserDescriptions"));
var Parser_1 = require("../dataClasses/Parser");
function ParserSelector(_a) {
    var authorDataUpdater = _a.authorDataUpdater, parserName = _a.parserName;
    function handleParserChange(event) {
        authorDataUpdater(function (aDataClone) {
            aDataClone.parser = Parser_1.parsersByName[event.target.value];
        });
    }
    return (React.createElement(React.Fragment, null,
        React.createElement("h1", null, " Choose your Natural Language Parser "),
        React.createElement("div", null,
            React.createElement(ParserDescriptions_1.default, null),
            React.createElement(FormControl_1.default, null,
                React.createElement(FormLabel_1.default, { id: "parsers-radio-buttons-group-label" }, "Parsers"),
                React.createElement(RadioGroup_1.default, { row: true, "aria-labelledby": "parsers-radio-buttons-group-label", defaultValue: Parser_1.defaultParser.name, name: "parserName", 
                    /* value={defaultParser.name} */
                    value: parserName, onChange: handleParserChange },
                    React.createElement(FormControlLabel_1.default, { value: "parts-of-speech", control: React.createElement(Radio_1.default, null), label: "Parts-of-Speech" }),
                    React.createElement(FormControlLabel_1.default, { value: "en-pos", control: React.createElement(Radio_1.default, null), label: "en-pos" }))))));
}
exports.default = ParserSelector;
