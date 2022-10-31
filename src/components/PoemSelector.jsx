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
          <InputLabel id={`${selName}-select-label`}>{capitalizeFirstLetter(selName)}</InputLabel>
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

function PoemSelector({
    author, setAuthor, authorList,
    title, setTitle, titleList,
    loadingProgress,
    textLines}) {

    function authorSelector() {
        return selector('author', author, setAuthor, authorList)
    }

    function titleSelector() {
        console.log(`setting title ${title} for ${author}`)
        return selector('title', title, setTitle, titleList)
    }

    return (
        <>
          <h1> Select a poem </h1>
          { authorSelector() }
          { titleSelector() }
          { loadingProgress.percentage > 0 &&
            loadingProgress.percentage < 100 &&
            <AuthorProgress {...loadingProgress}/>  }
          <textarea value={textLines && textLines.join("\n")} id="text-input" readOnly/>
        </>
    )
}

export default PoemSelector
