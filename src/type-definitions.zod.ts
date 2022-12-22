import { number, z } from "zod";

import { NounInverter, NounInverterFactory } from "./dataClasses/NounInverter";
import { Parser } from "./dataClasses/Parser";
import Poem from "./dataClasses/Poem";

// Experimentally collecting all the schemas in one file rather 
// than spread across many files (although they would be bound well
// in individual files ... consider splitting these up later with 
// many imports)

export const authorName = z.string();
export const title = z.string();
export const line = z.string();

export const author = z.object({
  name: authorName,
  titles: z.array(title),
  // (other) authorNames is encapsulated with an author to avoid 
  // going out of sync when loading new author names
  authorNames: z.array(authorName), 
  currentPoem: z.instanceof(Poem),
  currentParser: z.instanceof(Parser),
  nounInverter: z.instanceof(NounInverter).optional(),
  nounInverterFactory: z.instanceof(NounInverterFactory).optional(),
  stagedTitleChange: title.optional(),
  // TODO spec these funcs when I feel like implementing recursive types with 
  // z.lazy() over Author
  constructor: z.function().optional(),
  recomputeNounOutlines: z.function().optional(), 
  setPoem: z.function().optional(), 
  setParser: z.function().optional(),
})

// "Data" suffix can imply a parseable json object
export const poemData = z.map(title, z.array(line));
// WAS export const authorData = z.map(authorName, poemData);
export const poemsByAuthor = z.map(authorName, poemData);
export const titlesByAuthor = z.map(authorName, z.array(title));

export const stats = z.object({
    falsePos: z.number().refine(
        (val) => val > 0,
        (val) => ({ message: `False Positive ${val} must be greater than 0` })
    ), 
    falseNeg: z.number().refine(
        (val) => val > 0,
        (val) => ({ message: `False Negative ${val} must be greater than 0` })
    )
})