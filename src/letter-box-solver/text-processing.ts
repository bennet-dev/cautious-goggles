var natural = require("natural");
var WordPOS = require("wordpos");
import { readFileSync } from "fs";
import { difference, get } from "lodash";
import type { LetterBox } from "./shared-types";

const getWordBank = (): string[] => {
  return readFileSync("words.txt", "utf8").split("\n");
};

// The output of the tagger uses the Penn Treebank POS tag set. The full list of tags can be found here: https://www.ling.upenn.edu/courses/Fall_2003/ling001/penn_treebank_pos.html
// Relevant to this project are the following tags:
// NNP: Proper noun, singular
// NNPS: Proper noun, plural
// PRP: Personal pronoun
// PRP$: Possessive pronoun

type Tag = "NNP" | "NNPS" | "PRP" | "PRP$" | string;

const UNWANTED_TAGS: Tag[] = ["PRP", "PRP$", "NNPS", "NNP"];

type TaggedWord = {
  token: string;
  tag: Tag;
};

const wordpos = new WordPOS();

wordpos.getAdjectives(
  "The angry bear chased the frightened little squirrel.",
  function (result: any) {
    console.log(result);
  }
);
// [ 'little', 'angry', 'frightened' ]

wordpos.getPOS("America", (result: any) => {
  console.log("America", result);
});

wordpos.isAdjective("awesome", function (result: any) {
  console.log(result);
});

const tagWords = (wordsArray: string[]): TaggedWord[] => {
  const language = "EN";
  const defaultCategory = "N";
  const defaultCategoryCapitalized = "NNP";

  var lexicon = new natural.Lexicon(
    language,
    defaultCategory,
    defaultCategoryCapitalized
  );
  var ruleSet = new natural.RuleSet("EN");
  var tagger = new natural.BrillPOSTagger(lexicon, ruleSet);

  return tagger.tag(wordsArray).taggedWords;
};

const filterNonWords = (words: string[]) => {
  var wordnet = new natural.WordNet();

  return words.filter((word) =>
    wordnet.lookup(word, function (results: any) {
      console.log("word", word);
      console.log("results", results);
      if (!results || results.length === 0) {
        return false;
      }
      return true;
    })
  );
};

const filterByTags = (tags: Tag[]) => (taggedWords: TaggedWord[]) =>
  taggedWords
    .filter((word) => !tags.includes(word.tag))
    .map((word) => word.token);

const filterByMinLength = (length: number) => (words: string[]) =>
  words.filter((word) => word.length >= length);

const filterByLetters = (letters: string[]) => (words: string[]) =>
  words.filter((word) => {
    const split = word.split("");
    return difference(split, letters).length === 0;
  });

const filterByBoxEdge = (box: LetterBox) => (words: string[]) => {
  return words.filter((word) => {
    const split = word.split("");
    return !split.some((letter, index) => {
      const row = box.find((row) => row.includes(letter));
      if (row?.includes(split[index + 1])) return true;
    });
  });
};

// console.log(
//   filterByBoxEdge([
//     ["a", "b", "c"],
//     ["d", "e", "f"],
//     ["g", "h", "i"],
//   ])(["abc", "def", "ghi", "adg", "beh"])
// );

const pipe =
  (...fns: Function[]) =>
  (x: any) =>
    fns.reduce((acc, fn) => fn(acc), x);

export const processWords = (letterbox: LetterBox): string[] =>
  pipe(
    tagWords,
    filterByTags(UNWANTED_TAGS),
    filterNonWords,
    filterByMinLength(3),
    filterByLetters(letterbox.flat()),
    filterByBoxEdge(letterbox)
  )(getWordBank());
