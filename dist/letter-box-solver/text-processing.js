"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processWords = void 0;
var natural = require("natural");
var WordPOS = require("wordpos");
const fs_1 = require("fs");
const lodash_1 = require("lodash");
const getWordBank = () => {
    return (0, fs_1.readFileSync)("words.txt", "utf8").split("\n");
};
const UNWANTED_TAGS = ["PRP", "PRP$", "NNPS", "NNP"];
const wordpos = new WordPOS();
wordpos.getAdjectives("The angry bear chased the frightened little squirrel.", function (result) {
    console.log(result);
});
// [ 'little', 'angry', 'frightened' ]
wordpos.getPOS("America", (result) => {
    console.log("America", result);
});
wordpos.isAdjective("awesome", function (result) {
    console.log(result);
});
const tagWords = (wordsArray) => {
    const language = "EN";
    const defaultCategory = "N";
    const defaultCategoryCapitalized = "NNP";
    var lexicon = new natural.Lexicon(language, defaultCategory, defaultCategoryCapitalized);
    var ruleSet = new natural.RuleSet("EN");
    var tagger = new natural.BrillPOSTagger(lexicon, ruleSet);
    return tagger.tag(wordsArray).taggedWords;
};
const filterNonWords = (words) => {
    var wordnet = new natural.WordNet();
    return words.filter((word) => wordnet.lookup(word, function (results) {
        console.log("word", word);
        console.log("results", results);
        if (!results || results.length === 0) {
            return false;
        }
        return true;
    }));
};
const filterByTags = (tags) => (taggedWords) => taggedWords
    .filter((word) => !tags.includes(word.tag))
    .map((word) => word.token);
const filterByMinLength = (length) => (words) => words.filter((word) => word.length >= length);
const filterByLetters = (letters) => (words) => words.filter((word) => {
    const split = word.split("");
    return (0, lodash_1.difference)(split, letters).length === 0;
});
const filterByBoxEdge = (box) => (words) => {
    return words.filter((word) => {
        const split = word.split("");
        return !split.some((letter, index) => {
            const row = box.find((row) => row.includes(letter));
            if (row === null || row === void 0 ? void 0 : row.includes(split[index + 1]))
                return true;
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
const pipe = (...fns) => (x) => fns.reduce((acc, fn) => fn(acc), x);
const processWords = (letterbox) => pipe(tagWords, filterByTags(UNWANTED_TAGS), filterNonWords, filterByMinLength(3), filterByLetters(letterbox.flat()), filterByBoxEdge(letterbox))(getWordBank());
exports.processWords = processWords;
