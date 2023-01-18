"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var type_definitions_zod_1 = require("../type-definitions.zod");
var NounInverter_1 = require("./NounInverter");
// TODO define the schema for Poem to fix the errors here
// this is defined with prototypes to make use of zod parsing.
var Author = /** @class */ (function () {
    function Author() {
    }
    return Author;
}());
exports.default = Author;
;
Author.prototype.constructor = function (data) {
    Object.assign(this, type_definitions_zod_1.author.parse(data));
    this.nounInverterFactory = new NounInverter_1.NounInverterFactory(this);
    this.stagedTitleChange = this.currentPoem.title;
    this.recomputeNounOutlines();
};
Author.prototype.recomputeNounOutlines = function () {
    this.nounInverter = this.nounInverterFactory.get(this);
    this.nounInverter.recomputeNounOutlines();
};
// TODO go through code and replace setters for poem and parser with these
Author.prototype.setPoem = function (newPoem) {
    this.currentPoem = newPoem;
    this.recomputeNounOutlines();
};
Author.prototype.setParser = function (newParser) {
    this.currentParser = newParser;
    this.recomputeNounOutlines();
};
Author.prototype.updateCurrentStats = function (_a) {
    var falsePos = _a.falsePos, falseNeg = _a.falseNeg;
    var nounInverter = this.nounInverter;
    if (nounInverter) {
        nounInverter.falsePositiveCount = falsePos;
        nounInverter.falseNegativeCount = falseNeg;
    }
};
