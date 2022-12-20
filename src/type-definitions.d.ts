// The prefix "Structured" is used to distinguish something like 
// StructuredAuthorData from an instance of the AuthorData class.
// StructuredAuthorData is a plain old javascript object and it might
// be parsed to create an instance of AuthorData for example.

// map poem title strings to body string arrays (poem lines)
interface StructuredPoemData {
    [key: string]: string[];
}
// keys are author strings
interface StructuredAuthorData {
    [key: string]: StructuredPoemData;
}