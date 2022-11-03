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

function PoemSelector({authorData, authorDataUpdater, loadingProgress}) {

    function authorSelector() {
        function setAuthorName(name) {
            authorDataUpdater((aDataClone) => { aDataClone.name = name})
        }
        const {name, authorNames} = authorData
        return selector('author', name, setAuthorName, authorNames)
    }

    function titleSelector() {
        function setTitle(title) {
            authorDataUpdater((aDataClone) => { aDataClone.currentPoem.title = title})
        }
        const title = authorData.currentPoem.title
        const titles = authorData.titles
        return selector('title', title, setTitle, titles)
    }

    const lines = authorData.currentPoem.lines ?
          authorData.currentPoem.lines.join("\n") : ""

    const aD = authorData

    return (
        <>
          <h1> Select a poem </h1>
          { aD && aD.name && aD.authorNames && authorSelector() }
          { aD && aD.currentPoem?.title && aD.titles && titleSelector() }
          { loadingProgress.percentage > 0 &&
            loadingProgress.percentage < 100 &&
            <AuthorProgress {...loadingProgress}/>  }
          <textarea value={lines} id="text-input" readOnly/>
        </>
    )
}

export default PoemSelector
