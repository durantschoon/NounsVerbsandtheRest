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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var FormControl_1 = __importDefault(require("@mui/material/FormControl"));
var InputLabel_1 = __importDefault(require("@mui/material/InputLabel"));
var MenuItem_1 = __importDefault(require("@mui/material/MenuItem"));
var Select_1 = __importDefault(require("@mui/material/Select"));
var AuthorProgress_1 = __importDefault(require("./AuthorProgress"));
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
// generic selector used for authors and titles
function selector(selName, value, setter, valList) {
    var menuKey = 0;
    return (react_1.default.createElement(FormControl_1.default, { dense: "true" },
        react_1.default.createElement(InputLabel_1.default, { id: "".concat(selName, "-select-label") }, capitalizeFirstLetter(selName)),
        react_1.default.createElement(Select_1.default, { labelId: "".concat(selName, "-select-label"), id: "".concat(selName, "-select"), value: value, label: capitalizeFirstLetter(selName), onChange: function (event) { return setter(event.target.value); } }, valList.map(function (s) { return (react_1.default.createElement(MenuItem_1.default, { value: s, key: menuKey++ }, s)); }))));
}
function PoemSelector(_a) {
    var _b;
    var authorData = _a.authorData, authorDataUpdater = _a.authorDataUpdater, loadingProgress = _a.loadingProgress;
    function authorSelector() {
        function setAuthorName(name) {
            return authorDataUpdater(function (aDataClone) {
                aDataClone.name = name;
            });
        }
        var name = authorData.name, authorNames = authorData.authorNames;
        return selector("author", name, setAuthorName, authorNames);
    }
    function titleSelector() {
        function setTitle(title) {
            return authorDataUpdater(function (aDataClone) {
                aDataClone.stagedTitleChange = title;
            });
        }
        var title = authorData.currentPoem.title;
        var titles = authorData.titles;
        return selector("title", title, setTitle, titles);
    }
    var joinedLines = authorData.currentPoem.lines
        ? authorData.currentPoem.lines.join("\n")
        : "";
    var aD = authorData;
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement("h1", null, " Select a poem "),
        aD && aD.name && aD.authorNames && authorSelector(),
        aD && ((_b = aD.currentPoem) === null || _b === void 0 ? void 0 : _b.title) && aD.titles && titleSelector(),
        loadingProgress.percentage > 0 && loadingProgress.percentage < 100 && (react_1.default.createElement(AuthorProgress_1.default, __assign({}, loadingProgress))),
        react_1.default.createElement("textarea", { value: joinedLines, id: "text-input", readOnly: true })));
}
exports.default = PoemSelector;
