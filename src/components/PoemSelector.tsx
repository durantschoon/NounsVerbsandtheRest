import React from "react";

import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

import Author from "../dataClasses/Author";
import AuthorProgress from "./AuthorProgress";
import { 
  AuthorName, 
  AuthorClone, 
  AuthorUpdatorType,
  LoadingProgress,
} from "src/type-definitions";

function capitalizeFirstLetter(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// generic selector used for authors and titles
function selector(
  selName: string, 
  value: string, 
  setter: (s: string) => void, 
  valList: string[]) {
  let menuKey = 0;
  return (
    <FormControl margin="dense">
      <InputLabel id={`${selName}-select-label`}>
        {capitalizeFirstLetter(selName)}
      </InputLabel>
      <Select
        labelId={`${selName}-select-label`}
        id={`${selName}-select`}
        value={value}
        label={capitalizeFirstLetter(selName)}
        onChange={(event) => setter(event.target.value)}
      >
        {valList.map((s) => (
          <MenuItem value={s} key={menuKey++}>
            {s}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

type Props = {
  author: Author, 
  authorUpdater: AuthorUpdatorType, 
  loadingProgress: LoadingProgress
}

function PoemSelector({ author, authorUpdater, loadingProgress }: Props) {
  function authorSelector() {
    function setAuthorName(name: AuthorName) {
      return authorUpdater((clone: AuthorClone) => {
        clone.name = name;
      });
    }
    const { name, authorNames } = author;
    return selector("author", name, setAuthorName, authorNames);
  }

  function titleSelector() {
    function setTitle(title: string) {
      return authorUpdater((aDataClone) => {
        aDataClone.stagedTitleChange = title;
      });
    }
    const title = author.currentPoem.title;
    const titles = author.titles;
    return selector("title", title, setTitle, titles);
  }

  const joinedLines = author.currentPoem.lines
    ? author.currentPoem.lines.join("\n")
    : "";

  const aD = author;

  return (
    <>
      <h1> Select a poem </h1>
      {aD && aD.name && aD.authorNames && authorSelector()}
      {aD && aD.currentPoem?.title && aD.titles && titleSelector()}
      {loadingProgress.percentage > 0 && loadingProgress.percentage < 100 && (
        <AuthorProgress {...loadingProgress} />
      )}
      <textarea value={joinedLines} id="text-input" readOnly />
    </>
  );
}

export default PoemSelector;
