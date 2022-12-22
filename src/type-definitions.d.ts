import { z } from "zod";
import * as schemas from "./type-definitions.zod";

type AuthorName = z.infer<typeof schemas.authorName>
type Title = z.infer<typeof schemas.title>
type Line = z.infer<typeof schemas.line>

// named "AuthorType" to disambiguate from class "Author"
type AuthorType = z.infer<typeof schemas.author>

type PoemData = z.infer<typeof schemas.poemData>
// PoemsByAuthor was StructuredAuthorData
type PoemsByAuthor = z.infer<typeof schemas.poemsByAuthor> 
type TitlesByAuthor = z.infer<typeof schemas.titlesByAuthor>

type Stats = z.infer<typeof schemas.stats>