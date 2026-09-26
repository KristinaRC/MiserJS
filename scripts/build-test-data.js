'use strict';
import readline from 'node:readline/promises';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { open, writeFile } from 'node:fs/promises';

import MiserJSEngine from 'miserjs';

/** @import {MiserState, MiserResponse} from 'miserjs' */

const miserJSEngine = new MiserJSEngine();
const __dirname = import.meta.dirname;
let text;

// Read commands from file.
let commandFilepath = path.join(__dirname, '../src/node/speedrun/speedrun-commands.txt');
let commandFile = readFileSync(commandFilepath, 'utf8');
// Strip the carriage returns (CR) and linefeeds (LF).
commandFile = commandFile.replace(/[\r\n]+/g, '');
const testInput = commandFile.split(',');


let outputFilepath = path.join(__dirname, '../test/escape-data.txt');
let outputFile = await open(outputFilepath, 'w');

await outputFile.write('[\n');

let addComma = false;

for (const command of testInput) {
  let keyValArray = [command, miserJSEngine.request(command).text];
  let out = JSON.stringify( keyValArray);
  if (addComma) {
    out = `,\n${out}`;
  }
  await outputFile.write(`${out}`, null, 'utf8');
  addComma = true;
}

await outputFile.write('\n]');

await outputFile.close();
