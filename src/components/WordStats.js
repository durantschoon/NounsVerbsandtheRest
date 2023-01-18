"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function WordStats(_a) {
    var parserName = _a.parserName, falsePositiveCount = _a.falsePositiveCount, falseNegativeCount = _a.falseNegativeCount;
    return (React.createElement("fieldset", { id: "stats-fieldset" },
        React.createElement("legend", { id: "stats-legend" },
            React.createElement("b", null,
                React.createElement("i", null,
                    "Statistics for ",
                    parserName))),
        React.createElement("div", null,
            React.createElement("span", null,
                React.createElement("b", null, "False Positives:"),
                " ",
                falsePositiveCount,
                " "),
            React.createElement("span", null,
                React.createElement("b", null, "False Negatives:"),
                " ",
                falseNegativeCount)),
        React.createElement("b", null, "Total Incorrect:"),
        " ",
        falsePositiveCount + falseNegativeCount));
}
exports.default = WordStats;
