// The prefix "Structured" is used to distinguish something like 
// StructuredAuthorData from an instance of the AuthorData class.
// StructuredAuthorData is a plain old javascript object and it might
// be parsed to create an instance of AuthorData for example.

type AuthorName = string
type Title = string
type Line = string

interface StructuredPoemData {
    [title: Title]: Line[];
}
interface StructuredAuthorData {
    [author: AuthorName]: StructuredPoemData;
}
interface TitlesByAuthor {
    [author: string]: Title[] 
}