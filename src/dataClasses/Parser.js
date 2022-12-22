"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.EnP = exports.PoS = exports.parsersByName = exports.defaultParser = exports.parsers = exports.Parser = void 0;
var parts_of_speech_1 = require("parts-of-speech");
var en_pos_1 = require("en-pos");
var R = __importStar(require("ramda"));
var Parser = /** @class */ (function () {
    function Parser(name) {
        this.name = name;
    }
    return Parser;
}());
exports.Parser = Parser;
var PartsOfSpeech = /** @class */ (function (_super) {
    __extends(PartsOfSpeech, _super);
    function PartsOfSpeech() {
        var _this = _super.call(this, "parts-of-speech") || this;
        _this.info = {
            title: "Parts-of-Speech",
            body: "Javascript port of Mark Watson's FastTag Part of Speech Tagger which was itself based on Eric Brill's trained rule set and English lexicon",
            link: "https://github.com/dariusk/pos-js#readme",
        };
        return _this;
    }
    PartsOfSpeech.prototype.tagWordsInLine = function (line) {
        var words = new parts_of_speech_1.Lexer().lex(line);
        var tagger = new parts_of_speech_1.Tagger();
        return tagger.tag(words);
    };
    return PartsOfSpeech;
}(Parser));
var EnPos = /** @class */ (function (_super) {
    __extends(EnPos, _super);
    function EnPos() {
        var _this = _super.call(this, "en-pos") || this;
        _this.info = {
            title: "en-pos",
            body: "A better English POS tagger written in JavaScript",
            link: "https://github.com/finnlp/en-pos#readme",
        };
        return _this;
    }
    EnPos.prototype.tagWordsInLine = function (line) {
        line = R.filter(R.identity, line.split(/\s/));
        var tags = new en_pos_1.Tag(line)
            .initial() // initial dictionary and pattern based tagging
            .smooth().tags; // further context based smoothing
        var tagged = tags.map(function (tag, i) { return [line[i], tag]; });
        return tagged;
    };
    return EnPos;
}(Parser));
var PoS = new PartsOfSpeech();
exports.PoS = PoS;
var EnP = new EnPos();
exports.EnP = EnP;
var parsers = [PoS, EnP];
exports.parsers = parsers;
var defaultParser = parsers[0];
exports.defaultParser = defaultParser;
var byName = {};
for (var _i = 0, parsers_1 = parsers; _i < parsers_1.length; _i++) {
    var parser = parsers_1[_i];
    byName[parser.name] = parser;
}
var parsersByName = Object.freeze(byName);
exports.parsersByName = parsersByName;
