"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Box_1 = __importDefault(require("@mui/material/Box"));
var LinearProgress_1 = __importDefault(require("@mui/material/LinearProgress"));
function AuthorProgress(_a) {
    var authorName = _a.authorName, percentage = _a.percentage;
    return (React.createElement(Box_1.default, { sx: { width: '90%', margin: '1rem' } },
        React.createElement(LinearProgress_1.default, { variant: "determinate", value: percentage }),
        React.createElement("i", null, authorName)));
}
exports.default = AuthorProgress;
