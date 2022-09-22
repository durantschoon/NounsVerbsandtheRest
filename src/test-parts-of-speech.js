// let pos = require('pos');
// import pos from 'pos'
import {Tagger, Lexer} from 'parts-of-speech'

const samples = [
    'The quick brown fox jumps over the lazy dog.',    
    'This is some sample text. This text can contain multiple sentences.',
]

for (const sample of samples) {
    let words = new Lexer().lex(sample);
    let tagger = new Tagger();
    let taggedWords = tagger.tag(words);

    for (let i in taggedWords) {
        let taggedWord = taggedWords[i];
        let word = taggedWord[0];
        let tag = taggedWord[1];
        console.log(word + " /" + tag);
    }

    console.log("Here are the nouns (singular and plural) in the sample text:\n", 
        `Sample text: "${sample}"\n`,
        'Nouns: ',
        taggedWords.filter( pair => pair[1] === 'NN' || pair[1] === 'NNS').map( pair => pair[0] ),
        '\n',
        );
}


