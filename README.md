# Durant's Notes

Had to run `npm i vite@latest` before I could run `npm run dev`

Also had to run `npm i @mui/icons-material` to get the icons I needed.


# ToDo

Noun inversion should apply to a particular parser. 

## Two major ways I could refactor

### Parsers as objects (OOP)
Refactor so that `Parser` is an object. This should:
1. Remove the need for separate `nounInverters`
2. Remove the need for `tagWordsInLine` as an object (these just become methods per parser)
3. Fold `parserInfo` info the classes

### Using curried functions instead (functional approach)
1. `tagWordsInLine` currently switches by keys on an object, this could be a curried functions which consumes the parser first
2. `parserInfo` could be the same
# Stackblitz creation
## github-jfa5q4

[Edit on StackBlitz ⚡️](https://stackblitz.com/edit/github-jfa5q4)