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
var Parser_1 = require("../dataClasses/Parser");
var ToolTipped_jsx_1 = __importDefault(require("./ToolTipped.jsx"));
require("./ParserDescriptions.css");
function ParserDescriptions() {
    return (React.createElement("div", { id: "parser-descriptions" },
        React.createElement(ToolTipped_jsx_1.default, __assign({}, Parser_1.PoS.info)),
        React.createElement(ToolTipped_jsx_1.default, __assign({}, Parser_1.EnP.info))));
}
exports.default = ParserDescriptions;
