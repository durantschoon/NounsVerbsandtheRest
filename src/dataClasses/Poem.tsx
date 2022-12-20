import sonnets, {
    defaultAuthorName as dAuthorName,
    defaultTitle as dTitle,
    defaultTextLines as dLines,
} from '../data/sonnets'

export default class Poem {
    constructor(author, title, lines) {
        this.author = author
        this.title = title
        this.lines = lines
    }
}

export const defaultPoem = new Poem(dAuthorName, dTitle, dLines)
