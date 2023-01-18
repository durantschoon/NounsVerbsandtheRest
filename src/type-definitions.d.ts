import React from "react";

import { z } from "zod";
import * as schemas from "./type-definitions.zod";

import Author from "./dataClasses/Author";

/* Global Note: Variable Name suffices
 - "Data" is appended to names where the type is POJO consumed in parsing
    to become named object, e.g. PoemData would be parsed to become a Poem
 */

type AuthorName = z.infer<typeof schemas.authorName>
type AuthorData = z.infer<typeof schemas.authorData>

// Function that updates an AuthorClone, called by an AuthorUpdatorType
type AuthorClone = Author;
type AuthorCloneUpdatorType = (clone: AuthorClone, args?: any[]) => void;
// ideally args?: any[] would be enough instead of needing the following
type AuthorCloneUpdatorWithWordType = (
   clone: AuthorClone, 
   line: number, 
   word: number
   ) => void;


/* AuthorUpdatorType is a function that 
   1. actually clones the current author,
   2. applies a function to the clone (can be a chain a series of modifying functions)
   3. sets the actual state of author to the (modified) clone
*/ 
type AuthorUpdatorType = (func: AuthorCloneUpdatorType, args?: any[]) => void;

// Specific updator for a function that takes a line and a word number
type AuthorCloneApplyWordFuncType = (
   clone: AuthorClone, 
   func: AuthorCloneUpdatorWithWordType, 
   line: number, 
   word: number
   ) => void;

type Title = z.infer<typeof schemas.title>
type Line = z.infer<typeof schemas.line>

type PoemData = z.infer<typeof schemas.poemData>
type PoemsByAuthor = z.infer<typeof schemas.poemsByAuthor> 
type TitlesByAuthor = z.infer<typeof schemas.titlesByAuthor>

type Stats = z.infer<typeof schemas.stats>
type NounInverterType = z.infer<typeof schemas.nounInverter>
type NounInverterRep = z.infer<typeof schemas.nounInverterRep>

type Tags = z.infer<typeof schemas.tags>

type FalsePositive = z.infer<typeof schemas.falsePositive>
type FalseNegative = z.infer<typeof schemas.falseNegative>

type ParsersByName = z.infer<typeof schemas.parserMap>;

type LoadingProgress = z.infer<typeof schemas.loadingProgress>;

// type ClickEvent = React.SyntheticEvent<MouseEvent>
// type ClickEvent = React.SyntheticEvent<MouseEvent, EventTarget>
// type ClickEvent = React.SyntheticEvent<EventTarget>
// type ClickEvent = React.MouseEvent<EventTarget>
type ClickEvent = React.MouseEvent

type ChangeEvent = React.ChangeEvent