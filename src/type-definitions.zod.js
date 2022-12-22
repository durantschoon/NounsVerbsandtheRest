"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.titlesByAuthor = exports.authorData = exports.poemData = exports.author = exports.line = exports.title = exports.authorName = void 0;
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
exports.author = zod_1.z.object({
    name: exports.authorName,
    titles: zod_1.z.array(exports.title),
    authorNames: zod_1.z.array(exports.authorName),
    currentPoem: zod_1.z.instanceof(Poem_1.default),
    currentParser: zod_1.z.instanceof(Parser_1.Parser),
    nounInverter: zod_1.z.instanceof(NounInverter_1.NounInverter).optional(),
    stagedTitleChange: exports.title.optional()
});
// "Data" suffix can imply a parseable json object
exports.poemData = zod_1.z.map(exports.title, zod_1.z.array(exports.line));
exports.authorData = zod_1.z.map(exports.authorName, exports.poemData);
exports.titlesByAuthor = zod_1.z.map(exports.authorName, zod_1.z.array(exports.title));
