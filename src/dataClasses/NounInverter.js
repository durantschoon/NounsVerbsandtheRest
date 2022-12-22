"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NounInverterFactory = exports.nounInverterID = exports.NounInverter = void 0;
var R = __importStar(require("ramda"));
var spannedWord = function (mainClass, extraClasses, lineNum, wordNum, word) {
    return "<span class=\"".concat(mainClass, " ").concat(extraClasses, "\" id=\"word_").concat(lineNum, "_").concat(wordNum, "\">").concat(word, "</span>");
};
var punct = /([.,\/#!$%\^&\*;:{}=\-_`~()']+)/gm;
var spacePunct = /([\s.,\/#!$%\^&\*;:{}=\-_`~()']+)/gm;
var UNICODE_NBSP = "\u00A0";
/* A Noun Inverter
  for a specific parser and poem (lines of text) which are extracted from
  AuthorData

  Records weather the user has inverted the value of a word in a poem (changed
  "noun" -> "non-noun" or vice-versa)
  */
var NounInverter = /** @class */ (function () {
    function NounInverter(aData) {
        this.parser = aData.currentParser;
        var lines = (this.poemTextLines = aData.currentPoem.lines);
        this.falsePositiveCount = 0;
        this.falseNegativeCount = 0;
        // nounInverters are represented by jagged arrays of arrays indexed by
        //    (line, word) internally represented as zero-based arrays
        //    but externally represented as one-based.
        //    e.g. nounInverter.isInverted(3,7) === true
        //      means that the noun-state assigned by the parser for the word
        //      at line 3, word 7 has been inverted by the user
        //    i.e. inverted means now should be considered not-a-noun if originally
        //      a noun or vice-versa
        this.rep = lines ? new Array(lines.length).fill([]) : [[]];
        this.recomputeNounOutlines(); // completes initialization
    }
    // line, word are 1-based
    NounInverter.prototype.isInverted = function (line, word) {
        return this.rep[line - 1][word - 1];
    };
    // line, word are 1-based
    NounInverter.prototype.setInverted = function (line, word, wordIsInverted) {
        this.rep[line - 1][word - 1] = wordIsInverted;
    };
    // line, word are 1-based
    NounInverter.prototype.flip = function (line, word) {
        this.setInverted(line, word, !this.isInverted(line, word));
    };
    // lineNum is 1-based
    NounInverter.prototype.initLineIfNeeded = function (lineNum, lineLength) {
        if (this.rep.length === 0)
            return;
        if (this.rep[lineNum - 1].length === 0) {
            this.rep[lineNum - 1] = new Array(lineLength).fill(false);
        }
    };
    // Return the HTML of all the words tagged (as either noun or non-noun)
    NounInverter.prototype._getTaggedWordsHTML = function () {
        var _this = this;
        var lines = this.poemTextLines;
        var parser = this.parser;
        if (!lines) {
            return "";
        }
        var outlined = [];
        var addNounSpans = function (tagged, lineNum) {
            var mainClass;
            var extraClasses;
            var wordNum = 1; // 1-based
            return tagged.map(function (_a) {
                var word = _a[0], tag = _a[1];
                extraClasses = "";
                var nounTest = tag === "NN" || tag === "NNS";
                if (_this.isInverted(lineNum, wordNum)) {
                    nounTest = !nounTest;
                    extraClasses = "inverted";
                }
                mainClass = nounTest ? "noun" : "non-noun";
                return spannedWord(mainClass, extraClasses, lineNum, wordNum++, word);
            });
        };
        /* Algorithm
          - match the spaces and punctuation, save that as matchedSpacePunct
          - remove all the punctuation from the words and tag, saving in as
            parser.tagWordsInLine
          - Use the word count of each line to initialize each line of the NounInverter
          - Even out the saved punctuation and lines for recombination
          - Recombine the spaces and words in the right order, save as outlined
          - mark the current NounInverter as cloneable now that initialization is complete
        */
        lines.forEach(function (line, index) {
            var lineNum = index + 1;
            if (line === "") {
                outlined.push("");
                return;
            }
            var matchedSpacePunct = line
                .match(spacePunct)
                .map(function (s) { return s.replace(/ /g, UNICODE_NBSP); });
            var taggedWords = parser.tagWordsInLine(line.replaceAll(punct, ""));
            _this.initLineIfNeeded(lineNum, taggedWords.length);
            // even out the lengths of the two arrays for zipping
            if (matchedSpacePunct.length < taggedWords.length) {
                matchedSpacePunct.push("");
            }
            else if (taggedWords.length < matchedSpacePunct.length) {
                taggedWords.push(["", ""]);
            }
            // zip results in the correct order (i.e. starting with a space or not)
            var first, second;
            if (line[0].match(/\s/)) {
                first = matchedSpacePunct;
                second = addNounSpans(taggedWords, lineNum);
            }
            else {
                first = addNounSpans(taggedWords, lineNum);
                second = matchedSpacePunct;
            }
            var recombined = R.unnest(R.zip(first, second)).join("");
            outlined.push(recombined);
        });
        return outlined.join("<br>");
    };
    NounInverter.prototype.recomputeNounOutlines = function () {
        // Using getElementById here because the typical alternative seems far too
        // complicated: invoking useRef. We'd have to pass the ref through
        // authorData which contains the nounInverter. Note that the nounInverter
        // is cached so it seems like a potential problem if it references a ref
        // that gets re-created when the page rerenders.
        var textOuput = document.getElementById("text-output");
        if (!textOuput)
            return;
        textOuput.innerHTML = this.taggedWordsHTML = this._getTaggedWordsHTML();
    };
    return NounInverter;
}());
exports.NounInverter = NounInverter;
// Note: Uses string names as identifiers of the parser and poem because JS
// Map objects with non-string keys are unwieldy
function nounInverterID(aData) {
    var stringIDs = [
        aData.currentParser.name,
        aData.name,
        aData.currentPoem.title,
    ];
    var joinedArgs = stringIDs.join(" -- ");
    return joinedArgs;
}
exports.nounInverterID = nounInverterID;
/* store and reuse nounInverters in the memo cache
  keys are noun inverter IDs
  values are nounInverter objects
*/
var memoCache = new Map();
/* NounInverterFactory

  Essentially maps (parser, poem) -> nounInverter (new or cached)

  Parser and poem are extracted from the current values of an AuthorData object

  Behaves as if (parserName, authorName, poemTitle) is a tuple key.

  The factory returns the existing nounInverter if it already exists (in the
  memoCache) or creates a new one.
*/
var NounInverterFactory = /** @class */ (function () {
    function NounInverterFactory(aData) {
        this.get(aData);
    }
    NounInverterFactory.prototype.get = function (aData) {
        var id = nounInverterID(aData);
        if (!memoCache.has(id)) {
            memoCache.set(id, new NounInverter(aData));
        }
        return (this.inverter = memoCache.get(id));
    };
    return NounInverterFactory;
}());
exports.NounInverterFactory = NounInverterFactory;
exports.default = NounInverter;
