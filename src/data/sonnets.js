const sonnets = {
    "William Shakespeare": {
        'Sonnet 60': `Sonnet 60: Like As The Waves Make Towards The Pebbled Shore

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
      Praising thy worth, despite his cruel hand.`.split("\n"),
    },
    "Robert Frost": {
        "Acquainted With The Night": `Acquainted With The Night

    I have been one acquainted with the night.
    I have walked out in rain—and back in rain.
    I have outwalked the furthest city light.

    I have looked down the saddest city lane.
    I have passed by the watchman on his beat
    And dropped my eyes, unwilling to explain.

    I have stood still and stopped the sound of feet
    When far away an interrupted cry
    Came over houses from another street,

    But not to call me back or say good-bye;
    And further still at an unearthly height,
    One luminary clock against the sky

    Proclaimed the time was neither wrong nor right.
    I have been one acquainted with the night.`.split("\n")
    }
}

// the code below will automatically set variables for defaults

let authorName
let authorNames
let title
let titles
let textLines
let titlesByAuthor = {}
for (const [sAuthor, sonnetsByAuthor] of Object.entries(sonnets)) {
    if (authorName === undefined) {
        authorName = sAuthor
    }
    if (authorNames === undefined) {
        authorNames = [sAuthor]
    } else {
        authorNames.push(sAuthor)
    }
    for (const [sTitle, lines] of Object.entries(sonnetsByAuthor)) {
        if (title === undefined) {
            title = sTitle
        }
        if (titlesByAuthor[sAuthor] === undefined) {
            titlesByAuthor[sAuthor] = [sTitle] 
        } else {
            titlesByAuthor[sAuthor].push(sTitle)
        }
        if (textLines === undefined) {
            textLines = lines
        }
    }
    if (titles === undefined) {
        titles = titlesByAuthor[authorName]
    }
}

export const defaultAuthorName = authorName
export const defaultAuthorNames = authorNames
export const defaultTitle = title
export const defaultTitles = titles
export const defaultTitlesByAuthor = titlesByAuthor
export const defaultTextLines = textLines

export default sonnets
