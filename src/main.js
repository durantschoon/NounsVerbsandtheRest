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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = __importStar(require("react"));
var client_1 = require("react-dom/client");
var CssBaseline_1 = __importDefault(require("@mui/material/CssBaseline"));
var ThemeProvider_1 = __importDefault(require("@mui/material/styles/ThemeProvider"));
var App_1 = __importDefault(require("./App"));
var theme_1 = __importDefault(require("./theme"));
var rootElement = document.getElementById('root');
var root = (0, client_1.createRoot)(rootElement);
root.render(React.createElement(React.StrictMode, null,
    React.createElement(ThemeProvider_1.default, { theme: theme_1.default },
        React.createElement(CssBaseline_1.default, null),
        React.createElement(App_1.default, null))));
