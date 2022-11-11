// const Tag = require("en-pos").Tag;
import {Tag} from "en-pos"
import * as R from 'ramda'

const sentences = [
    'The quick brown fox jumps over the lazy dog.',
    'This is some sample text. This text can contain multiple sentences.',
]

for (let sentence of sentences) {
    sentence = sentence.split(" ")

    var tags = new Tag(sentence)
        .initial() // initial dictionary and pattern based tagging
        .smooth() // further context based smoothing
        .tags;
    // eg. ["DT","VBZ","PRP$","NN"]
    console.log(R.zip(sentence, tags))
    // eg. [["this","DT"],["is","VBZ"],["my","PRP$"],["sentence","NN"]]
    const nouns = tags.map ( (tag, i) => tag === 'NN' || tag === 'NNS'? sentence[i] : null ).filter( R.identity )
    console.log("nouns", nouns)
}

