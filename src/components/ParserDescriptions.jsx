import Tooltipped from './ToolTipped.jsx'

import "./ParserDescriptions.css";

import {Tagger, Lexer} from 'parts-of-speech'
import {Tag} from 'en-pos'

import * as R from 'ramda'

const PARSERS = {
    PARTS_OF_SPEECH: 'parts-of-speech',
    EN_POS: 'en-pos',
}

const P = PARSERS

const tagWordsInLine = {
    [P.PARTS_OF_SPEECH]: (line) => {
        let words = new Lexer().lex(line);
        let tagger = new Tagger();
        return tagger.tag(words);
    },
    [P.EN_POS]: (line) => {
        line = R.filter(R.identity, line.split(/\s/))
        var tags = new Tag(line)
            .initial() // initial dictionary and pattern based tagging
            .smooth() // further context based smoothing
            .tags;
        const tagged = tags.map ( (tag, i) => [line[i], tag] )
        return tagged
    }
}

const parserInfo = {
    [P.PARTS_OF_SPEECH]: {
        title: "Parts-of-Speech",
        body: "Javascript port of Mark Watson's FastTag Part of Speech Tagger which was itself based on Eric Brill's trained rule set and English lexicon", 
        link: "https://github.com/dariusk/pos-js#readme",
    },
    [P.EN_POS]: {
        title: "en-pos",
        body: "A better English POS tagger written in JavaScript",
        link: "https://github.com/finnlp/en-pos#readme",
    }    
}

function ParserDescriptions() {
    return (
        <div id="parser-descriptions">
            <Tooltipped {...parserInfo[P.PARTS_OF_SPEECH]} />
            <Tooltipped {...parserInfo[P.EN_POS]}/>
        </div>
    )
}

export {PARSERS, tagWordsInLine, ParserDescriptions}