"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var ParserSelector_1 = __importDefault(require("./ParserSelector"));
var WordStats_1 = __importDefault(require("./WordStats"));
function ParserChallenger(_a) {
    var authorData = _a.authorData, authorDataUpdater = _a.authorDataUpdater, authorDataApplyFunc = _a.authorDataApplyFunc, parser = _a.parser;
    var _b = (0, react_1.useState)({ falsePos: 0, falseNeg: 0 }), stats = _b[0], setStats = _b[1];
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
        var stats = {
            falsePos: document.getElementsByClassName("non-noun inverted").length,
            falseNeg: document.getElementsByClassName("noun inverted").length,
        };
        setStats(stats);
        // update the clone before binding it in the click handlers
        aDataClone.updateCurrentStats(stats);
        _addClickHandlersToSpans(aDataClone);
    }
    var drawNounOutlinesUpdater = function () { return authorDataUpdater(_drawNounOutlines); };
    // changing the poem (lines) or parser will trigger redrawing of noun outlines
    (0, react_1.useEffect)(drawNounOutlinesUpdater, [
        authorData.currentPoem.title,
        authorData.currentParser.name,
    ]);
    function _invertNoun(aDataClone, line, word) {
        aDataClone.nounInverter.flip(line, word);
        _drawNounOutlines(aDataClone);
    }
    var applyInvertNouns = function (aDataClone, line, word) {
        return authorDataApplyFunc(aDataClone, _invertNoun, [line, word]);
    };
    // clicking on a word should also trigger redrawing of noun outlines
    function _addClickHandlersToSpans(aDataClone) {
        var classNames = ["noun", "non-noun"];
        for (var _i = 0, classNames_1 = classNames; _i < classNames_1.length; _i++) {
            var className = classNames_1[_i];
            var spans = document.getElementsByClassName(className);
            for (var _a = 0, spans_1 = spans; _a < spans_1.length; _a++) {
                var span = spans_1[_a];
                span.addEventListener("click", function (event) {
                    event.stopPropagation();
                    var _a = event.target.id.split("_").slice(1), line = _a[0], word = _a[1];
                    applyInvertNouns(aDataClone, +line, +word);
                });
            }
        }
    }
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(ParserSelector_1.default, __assign({}, { authorDataUpdater: authorDataUpdater, parserName: authorData.currentParser.name })),
        react_1.default.createElement("h1", null, " Correct what is and is not a noun "),
        react_1.default.createElement("ul", null,
            react_1.default.createElement("li", null,
                "Click on a word with the ",
                react_1.default.createElement("span", { className: "non-noun" }, "Plus"),
                " ",
                react_1.default.createElement("img", { id: "non-noun-cursor-img" }),
                " cursor to change a word INTO a noun."),
            react_1.default.createElement("li", null,
                "Click on a word with the ",
                react_1.default.createElement("span", { className: "noun" }, "Back"),
                " ",
                react_1.default.createElement("img", { id: "noun-cursor-img" }),
                " cursor to change a word BACK TO a non-noun.")),
        react_1.default.createElement("div", { id: "text-output" }),
        react_1.default.createElement(WordStats_1.default, __assign({}, {
            parserName: parser.name,
            falsePositiveCount: stats.falsePos,
            falseNegativeCount: stats.falseNeg,
        }))));
}
exports.default = ParserChallenger;
