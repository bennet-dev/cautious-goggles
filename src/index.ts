import { solve } from "./letter-box-solver/letter-box";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const rl = readline.createInterface({ input, output });

const askForRows = async (): Promise<string[]> => {
  const rows: string[] = [];
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
    const result = await solve(letterRows);

    console.log(`Results: ${result}`);
  } catch (err) {
    console.error("An error occurred:", err);
  } finally {
    rl.close();
  }
};

main();
