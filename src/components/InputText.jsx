import PropTypes from 'prop-types';

import { Grid } from '@mui/material';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

import {useState, useEffect} from 'react'
import {Tagger, Lexer} from 'parts-of-speech'
import {Tag} from "en-pos"
import * as R from 'ramda'

import Tooltipped from './ToolTipped.jsx'
import "./InputText.css";

const defaultParser = 'parts-of-speech'  

const defaultTextLines = `Sonnet 60: Like As The Waves Make Towards The Pebbled Shore

Like as the waves make towards the pebbled shore,
So do our minutes hasten to their end;
Each changing place with that which goes before,
In sequent toil all forwards do contend.
Nativity, once in the main of light,
Crawls to maturity, wherewith being crowned,
Crooked eclipses ‘gainst his glory fight,
And Time that gave doth now his gift confound.
Time doth transfix the flourish set on youth
And delves the parallels in beauty’s brow,
Feeds on the rarities of nature’s truth,
And nothing stands but for his scythe to mow:
  And yet to times in hope, my verse shall stand
  Praising thy worth, despite his cruel hand.
`.split('\n')

const tagWordsInLine = {
    'parts-of-speech': (line) => {
        let words = new Lexer().lex(line);
        let tagger = new Tagger();
        return tagger.tag(words);
    },
    'en-pos': (line) => {
        line = R.filter(R.identity, line.split(/\s/))
        var tags = new Tag(line)
            .initial() // initial dictionary and pattern based tagging
            .smooth() // further context based smoothing
            .tags;
        const tagged = tags.map ( (tag, i) => [line[i], tag] )
        return tagged
    }
}

const punct = /([.,\/#!$%\^&\*;:{}=\-_`~()]+)/gm
const spacePunct = /([\s.,\/#!$%\^&\*;:{}=\-_`~()]+)/gm
const notSpacePunct = /([^\s.,\/#!$%\^&\*;:{}=\-_`~()]+)/gm
const UNICODE_NBSP = "\u00A0"

function InputText(props) {
    const [textLines, setTextLines] = useState(defaultTextLines)
    const [parser, setParser] = useState(defaultParser)

    const addNounSpans = (tagged) => {
        return tagged.map( ([word, tag]) => {
            if (tag === 'NN' || tag === 'NNS') {
                return `<span class="noun">${word}</span>` // html not JSX so 'class' not 'className'
            }
            return `<span class="non-noun">${word}</span>`
        })
    }

    useEffect( () => {
        let outlined = []

        for (const line of textLines) {
            if (line === '') {
                outlined.push('')
                continue
            }
            const matchedSpacePunct = line.match(spacePunct).map( s => s.replace(/ /g, UNICODE_NBSP) )

            let taggedWords = tagWordsInLine[parser](line.replaceAll(punct, ''));
            if (matchedSpacePunct.length < taggedWords.length) {
                matchedSpacePunct.push('')
            } else if (taggedWords.length < matchedSpacePunct.length) {
                taggedWords.push(['', ''])
            }
            let first, second
            if (line[0].match(/\s/)) {
                first = matchedSpacePunct
                second = addNounSpans(taggedWords)
            } else {
                first = addNounSpans(taggedWords)
                second = matchedSpacePunct
            }
            const recombined = R.unnest(R.zip(first, second)).join('')
            outlined.push(recombined)
        }
        document.getElementById("text-output").innerHTML = outlined.join('<br>')
    }, [textLines, parser])

    function handleParserChange (event) {
        const {value} = event.target
        setParser(value)
    }

  return (
    <section>
        <Grid container spacing={2}>
            <Grid item xs={6}>
                <h1> Enter your text </h1>
                <textarea value={textLines.join("\n")} id="text-input"/>
            </Grid>
            <Grid item xs={6}>
                <h1> Choose your Natural Language Parser </h1>
                <div>
                    <div id="parser-descriptions">
                        <Tooltipped 
                            title="Parts-of-Speech"
                            body="Javascript port of Mark Watson's FastTag Part of Speech Tagger which was itself based on Eric Brill's trained rule set and English lexicon"
                            link="https://github.com/dariusk/pos-js#readme"
                        />
                        {"          "}
                        <Tooltipped 
                            title="en-pos"
                            body="A better English POS tagger written in JavaScript"
                            link="https://github.com/finnlp/en-pos#readme"
                        />
                    </div>
                    <FormControl>
                        <FormLabel id="parsers-radio-buttons-group-label">Parsers</FormLabel>
                        <RadioGroup
                            row
                            aria-labelledby="parsers-radio-buttons-group-label"
                            defaultValue={defaultParser}
                            name="parser"
                            value={parser}
                            onChange={handleParserChange}
                        >
                            <FormControlLabel value="parts-of-speech" control={<Radio />} label="Parts-of-Speech" />
                            <FormControlLabel value="en-pos" control={<Radio />} label="en-pos" />
                        </RadioGroup>
                    </FormControl> 
                </div>
                <h1> Correct what is and is not a noun </h1>
                <ul>
                    <li>Click on a word with the <span class="non-noun">Plus</span> icon to change a word INTO a noun.</li>
                    <li>Click on a word with the <span class="noun">Back</span> icon to change a word BACK TO a non-noun.</li>
                </ul>
                <div id="text-output"></div>
            </Grid>
        </Grid>
    </section>
  )
}

// InputText.propTypes = {
//     parser: PropTypes.oneOf(['parts-of-speech', 'en-pos']).isRequired,
// };

export default InputText;