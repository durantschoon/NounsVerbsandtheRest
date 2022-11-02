import sonnets, {
    defaultAuthorName,
    defaultTitle,
    defaultTextLines,
} from '../data/sonnets'

class Poem {
    constructor(author, title, lines) {
        this.author = author
        this.title = title
        this.lines = lines
    }
}

export const defaultPoem = Poem(defaultAuthorName, defaultTitle, defaultTextLines)

export default Poem
