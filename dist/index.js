"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const letter_box_1 = require("./letter-box-solver/letter-box");
const promises_1 = __importDefault(require("node:readline/promises"));
const node_process_1 = require("node:process");
const rl = promises_1.default.createInterface({ input: node_process_1.stdin, output: node_process_1.stdout });
const askForRows = async () => {
    const rows = [];
    for (let i = 0; i < 4; i++) {
        const row = await rl.question(`Enter row ${i + 1}: `);
        rows.push(row);
    }
    return rows;
};
const main = async () => {
    try {
        console.log("Provide 4 rows of 3 letters, no spaces, no commas");
        console.log("e.g 'xyz'");
        const rows = await askForRows();
        const letterRows = rows.map((row) => row.split(""));
        const result = await (0, letter_box_1.solve)(letterRows);
        console.log(`Results: ${result}`);
    }
    catch (err) {
        console.error("An error occurred:", err);
    }
    finally {
        rl.close();
    }
};
main();
