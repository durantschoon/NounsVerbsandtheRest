import React from 'react'

import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

import AuthorProgress from './AuthorProgress'

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// generic selector used for authors and titles
function selector(selName, value, setter, valList) {
    let menuKey = 0
    return (
        <FormControl dense="true">
          <InputLabel id={`${selName}-select-label`}>
            {capitalizeFirstLetter(selName)}
          </InputLabel>
          <Select
            labelId={`${selName}-select-label`}
            id={`${selName}-select`}
            value={value}
            label={capitalizeFirstLetter(selName)}
            onChange={ (event) => setter(event.target.value) }
          >
            {valList.map( s => (<MenuItem value={s} key={menuKey++}>{s}</MenuItem>) )}
          </Select>
        </FormControl>
    )
}

function PoemSelector({author, authorDataUpdater, loadingProgress}) {

    function authorSelector() {
        console.log(`authorSelector args name = "${author.name}" list =`, author.authorNames)
        function setAuthorName(name) {
            authorDataUpdater(() => { aDataClone.name = name})
        }
        return selector('author', author.name, setAuthorName, author.authorNames)
    }

    function titleSelector() {
        console.log(`titleSelector args title = "${author.currentTitle}" list =`, author.titles)
        function setTitle(title) {
            authorDataUpdater(() => { aDataClone.currentTitle = title})
        }
        return selector('title', author.currentTitle, setTitle, author.titles)
    }

    const lines = author.currentLines ? author.currentLines.join("\n") : ""

    return (
        <>
          <h1> Select a poem </h1>
          { author && author.name && author.authorNameList && authorSelector() }
          { author && author.currentTitle && author.titleList && titleSelector() }
          { loadingProgress.percentage > 0 &&
            loadingProgress.percentage < 100 &&
            <AuthorProgress {...loadingProgress}/>  }
          <textarea value={lines} id="text-input" readOnly/>
        </>
    )
}

export default PoemSelector
