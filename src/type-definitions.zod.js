"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.author = exports.nounInverter = exports.stats = exports.falseNegative = exports.falsePositive = exports.titlesByAuthor = exports.poemsByAuthor = exports.poemData = exports.line = exports.title = exports.authorName = void 0;
var zod_1 = require("zod");
var NounInverter_1 = require("./dataClasses/NounInverter");
var Parser_1 = require("./dataClasses/Parser");
var Poem_1 = __importDefault(require("./dataClasses/Poem"));
// Experimentally collecting all the schemas in one file rather 
// than spread across many files (although they would be bound well
// in individual files ... consider splitting these up later with 
// many imports)
exports.authorName = zod_1.z.string();
exports.title = zod_1.z.string();
exports.line = zod_1.z.string();
// "Data" suffix can imply a parseable json object
exports.poemData = zod_1.z.map(exports.title, zod_1.z.array(exports.line));
// Delete following line when TS conversion is done
// WAS export const authorData = z.map(authorName, poemData);
exports.poemsByAuthor = zod_1.z.map(exports.authorName, exports.poemData);
exports.titlesByAuthor = zod_1.z.map(exports.authorName, zod_1.z.array(exports.title));
exports.falsePositive = zod_1.z.number().refine(function (val) { return val >= 0; }, function (val) { return ({ message: "False Positive ".concat(val, " must be greater than or equal to 0") }); });
exports.falseNegative = zod_1.z.number().refine(function (val) { return val >= 0; }, function (val) { return ({ message: "False Negative ".concat(val, " must be greater than or equal to 0") }); });
exports.stats = zod_1.z.object({
    falsePos: exports.falsePositive,
    falseNeg: exports.falseNegative
});
exports.nounInverter = zod_1.z.object({
    parser: zod_1.z.instanceof(Parser_1.Parser),
    falsePositiveCount: exports.falsePositive,
    falseNegativeCount: exports.falseNegative,
    // for a given (line, word) in a poem, a nounInverter will tell you if the 
    //    noun state has been inverted (by the user in contrast to the parser)
    // nounInverters are represented as `rep` by jagged arrays of arrays indexed by
    //    (line, word) internally represented as zero-based arrays
    //    but externally represented as one-based.
    //    e.g. nounInverter.isInverted(1,1) is for the first word in the poem
    //    e.g. nounInverter.isInverted(3,7) === true
    //      means that the noun-state assigned by the parser for the word
    //      at line 3, word 7 has been inverted by the user
    //    i.e. inverted means now should be considered not-a-noun if originally
    //      a noun and vice-versa
    rep: zod_1.z.array(zod_1.z.array(exports.line)),
    // TODO: define args, return, etc.
    recomputeNounOutlines: zod_1.z.function().optional(),
});
exports.author = zod_1.z.object({
    name: exports.authorName,
    titles: zod_1.z.array(exports.title),
    // (other) authorNames is encapsulated in each author to avoid 
    // going out of sync when loading new author names
    authorNames: zod_1.z.array(exports.authorName),
    currentPoem: zod_1.z.instanceof(Poem_1.default),
    currentParser: zod_1.z.instanceof(Parser_1.Parser),
    nounInverter: exports.nounInverter.optional(),
    nounInverterFactory: zod_1.z.instanceof(NounInverter_1.NounInverterFactory).optional(),
    stagedTitleChange: exports.title.optional(),
    // TODO spec these funcs when I feel like implementing recursive types with 
    // z.lazy() over Author
    constructor: zod_1.z.function(),
    recomputeNounOutlines: zod_1.z.function(),
    setPoem: zod_1.z.function(),
    setParser: zod_1.z.function(),
    updateCurrentStats: zod_1.z.function(),
});
