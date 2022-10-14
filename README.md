<img width="1675" alt="NVR Screen Shot 2022-10-12" src="https://user-images.githubusercontent.com/12535192/195400830-ea987633-c365-4077-bfcf-2d0b46d11a8a.png">


# Durant's Notes

Had to run `npm i vite@latest` before I could run `npm run dev`

Also had to run `npm i @mui/icons-material` to get the icons I needed, etc.


# ToDo

The purspose of this personal project is to mostly stay in practice by adding a new feature regularly (daily or almost-daily). Of course the more features that are added, the observant programmer will notice ways they'd like to refactor. 

## Two ways I could refactor

I'm am still currently focused on adding small features, but to decide which of the two following refactorings to make, I plan to consider the [Extensibility / Expressibility Trade-off](https://www.youtube.com/watch?v=FWW87fvBKJg) (the sample code in the video uses Haskell to explain the functional example and C# to explain the Object Oriented example, but everything is fully explained to the level of the non-Haskell, non-C# programmer ... huge thanks to Nils for recommending the video to me, but he'll probably never see this.). 

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
