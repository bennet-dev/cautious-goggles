import { difference, last, random } from "lodash";
import { readFileSync } from "fs";

const wordBank: string[] = readFileSync("words.txt", "utf8").split("\n");

/** Conditions for keeping a word:
 * 1. The word must be at least 3 letters long
 * 2. The word must be made up of letters in the letterRows
 * 3. The word cannot have any letters in sequence that are in the same row
 */
const wordFilter = (word: string, letterRows: string[][]) => {
  const split = word.split("");
  if (word.length < 3) return false;
  if (difference(split, letterRows.flat()).length > 0) return false;

  if (
    split.some((letter, index) => {
      const row = letterRows.find((row) => row.includes(letter));
      if (row?.includes(split[index + 1])) return true;
    })
  )
    return false;
  return true;
};

const buildLeterGrah = (words: string[]) => {
  return words.reduce((acc: Record<string, string[]>, word: string) => {
    return {
      ...acc,
      [word[0]]: acc[word[0]] ? [...acc[word[0]], word] : [word],
    };
  }, {});
};

const buildWordGraph = (
  words: string[],
  letterGraph: Record<string, string[]>
) => {
  return words.reduce((acc: Record<string, string[]>, word: string) => {
    return {
      ...acc,
      [word]: letterGraph[last(word)!] ? [...letterGraph[last(word)!]] : [],
    };
  }, {});
};

/**Goal of the game:
 * 1. Find the shortest sequence of words that, combined, contain all the letters in the letterRows.
 * 2. Each word in the sequence must start with the last letter of the previous word.
 */

const findWordSequence = (
  graph: Record<string, string[]>,
  startWord: string,
  maxSequenceLength = 6
) => {
  let lettersUsed: Set<string> = new Set();
  let sequence: string[] = [];

  let currentWord = startWord;
  while (lettersUsed.size < 12) {
    if (sequence.length >= maxSequenceLength) break;
    if (lettersUsed.size === 12) break;
    sequence.push(currentWord);
    if (currentWord) {
      Array.from(currentWord).forEach((letter) => lettersUsed.add(letter));
    }
    if (!graph[currentWord] || graph[currentWord].length === 0) break; // No more words to add
    currentWord = graph[currentWord][random(0, graph[currentWord].length - 1)];
  }
  return sequence;
};

const randomWalkAsync = (
  graph: Record<string, string[]>,
  startWord: string
) => {
  return new Promise((resolve) => {
    // Use setTimeout to yield control to the event loop
    setTimeout(() => {
      const sequence = findWordSequence(graph, startWord);
      resolve(sequence);
    }, 0);
  });
};

const parallelSearch = async (
  letterRows: string[][],
  graph: Record<string, string[]>,
  startWords: string[],
  numWalks = 10
) => {
  // Create an array of promises from random walks
  const promises = [];
  for (let i = 0; i < numWalks; i++) {
    // Pick a random starting word from the given list
    const startWord = startWords[random(0, startWords.length - 1)];
    promises.push(randomWalkAsync(graph, startWord));
  }

  // Wait for all random walks to finish
  const sequences: string[][] = (await Promise.all(promises)) as string[][];
  const flatLetters = letterRows.flat();

  const seqLetters = (seq: string[]) => seq.join("").split("");

  const shortestSequence = sequences
    .filter((seq) => seq !== null)
    .reduce((best, current) =>
      best.length < difference(seqLetters(current), flatLetters).length
        ? best
        : current
    );

  return shortestSequence;
};

export const solve = async (letterRows: string[][]) => {
  const filteredWords = wordBank.filter((word) => wordFilter(word, letterRows));

  const letterGraph = buildLeterGrah(filteredWords);

  const wordGraph = buildWordGraph(
    filteredWords.filter((word) => wordFilter(word, letterRows)),
    letterGraph
  );

  const startWords = Object.keys(wordGraph);

  const bestSequence = await parallelSearch(
    letterRows,
    wordGraph,
    startWords,
    100
  );

  return bestSequence || [];
};
