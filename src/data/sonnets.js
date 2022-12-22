"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultTitlesByAuthor = exports.defaultAuthorNames = exports.defaultTextLines = exports.defaultTitles = exports.defaultTitle = exports.defaultAuthorName = void 0;
var sonnets = {
    "William Shakespeare": {
        'Sonnet 60': "Sonnet 60: Like As The Waves Make Towards The Pebbled Shore\n\n    Like as the waves make towards the pebbled shore,\n    So do our minutes hasten to their end;\n    Each changing place with that which goes before,\n    In sequent toil all forwards do contend.\n    Nativity, once in the main of light,\n    Crawls to maturity, wherewith being crowned,\n    Crooked eclipses \u2018gainst his glory fight,\n    And Time that gave doth now his gift confound.\n    Time doth transfix the flourish set on youth\n    And delves the parallels in beauty\u2019s brow,\n    Feeds on the rarities of nature\u2019s truth,\n    And nothing stands but for his scythe to mow:\n      And yet to times in hope, my verse shall stand\n      Praising thy worth, despite his cruel hand.".split("\n"),
    },
    "Robert Frost": {
        "Acquainted With The Night": "Acquainted With The Night\n\n    I have been one acquainted with the night.\n    I have walked out in rain\u2014and back in rain.\n    I have outwalked the furthest city light.\n\n    I have looked down the saddest city lane.\n    I have passed by the watchman on his beat\n    And dropped my eyes, unwilling to explain.\n\n    I have stood still and stopped the sound of feet\n    When far away an interrupted cry\n    Came over houses from another street,\n\n    But not to call me back or say good-bye;\n    And further still at an unearthly height,\n    One luminary clock against the sky\n\n    Proclaimed the time was neither wrong nor right.\n    I have been one acquainted with the night.".split("\n")
    }
};
// the code below will automatically set variables for defaults
var firstAuthorName;
var firstTitle;
var firstTitles;
var firstPoemLines;
var authorNames = [];
var titlesByAuthor = {};
for (var _i = 0, _a = Object.entries(sonnets); _i < _a.length; _i++) {
    var _b = _a[_i], sAuthor = _b[0], sonnetsByAuthor = _b[1];
    firstAuthorName = firstAuthorName !== null && firstAuthorName !== void 0 ? firstAuthorName : sAuthor;
    authorNames.push(sAuthor);
    titlesByAuthor[sAuthor] = [];
    for (var _c = 0, _d = Object.entries(sonnetsByAuthor); _c < _d.length; _c++) {
        var _e = _d[_c], sTitle = _e[0], lines = _e[1];
        firstTitle = firstTitle !== null && firstTitle !== void 0 ? firstTitle : sTitle;
        titlesByAuthor[sAuthor].push(sTitle);
        firstPoemLines = firstPoemLines !== null && firstPoemLines !== void 0 ? firstPoemLines : lines;
    }
    firstTitles = firstTitles !== null && firstTitles !== void 0 ? firstTitles : titlesByAuthor[firstAuthorName];
}
exports.defaultAuthorName = firstAuthorName;
exports.defaultTitle = firstTitle;
exports.defaultTitles = firstTitles;
exports.defaultTextLines = firstPoemLines; // TODO change in multiple files to defaultPoemLines
exports.defaultAuthorNames = authorNames;
exports.defaultTitlesByAuthor = titlesByAuthor;
exports.default = sonnets;
