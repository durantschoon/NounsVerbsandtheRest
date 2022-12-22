"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var createTheme_1 = __importDefault(require("@mui/material/styles/createTheme"));
var colors_1 = require("@mui/material/colors");
// Create a theme instance.
var theme = (0, createTheme_1.default)({
    palette: {
        primary: {
            main: '#556cd6',
        },
        secondary: {
            main: '#19857b',
        },
        error: {
            main: colors_1.red.A400,
        },
    },
});
exports.default = theme;
