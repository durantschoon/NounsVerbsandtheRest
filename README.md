<img width="1675" alt="NVR Screen Shot 2022-10-12" src="https://user-images.githubusercontent.com/12535192/195400830-ea987633-c365-4077-bfcf-2d0b46d11a8a.png">


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

Originally with react-vite-mui on StackBlitz (nothing saved there though now)
