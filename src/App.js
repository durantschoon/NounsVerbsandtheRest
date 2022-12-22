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
var AppBar_1 = __importDefault(require("@mui/material/AppBar"));
var Box_1 = __importDefault(require("@mui/material/Box"));
var Toolbar_1 = __importDefault(require("@mui/material/Toolbar"));
var Typography_1 = __importDefault(require("@mui/material/Typography"));
var createTheme_1 = __importDefault(require("@mui/material/styles/createTheme"));
var ThemeProvider_1 = __importDefault(require("@mui/material/styles/ThemeProvider"));
require("./App.css");
var PoemView_1 = __importDefault(require("./components/PoemView"));
var theme = (0, createTheme_1.default)({
    palette: {
        primary: {
            main: "#807b67",
        },
        secondary: {
            main: "#f8f7f6",
        },
    },
    components: {
        MuiFormControl: {
            styleOverrides: {
                // Name of the slot
                root: {
                    // Some CSS
                    margin: "4px",
                },
            },
        },
    },
});
function App() {
    return (React.createElement(ThemeProvider_1.default, { theme: theme },
        React.createElement(Box_1.default, { sx: { flexGrow: 1 } },
            React.createElement(AppBar_1.default, { position: "static" },
                React.createElement(Toolbar_1.default, null,
                    React.createElement(Typography_1.default, { variant: "h4", component: "div", sx: { flexGrow: 1 } }, "Nouns, Verbs and the Rest"))),
            React.createElement(Box_1.default, { sx: { flexGrow: 1 } },
                React.createElement(PoemView_1.default, null)))));
}
exports.default = App;
