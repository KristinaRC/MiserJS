'use strict';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { readFileSync } from 'node:fs';
import { open, writeFile, readFile } from 'node:fs/promises';
import { argv, exit } from 'node:process';
import MiserEngine from './miserengine.js';

/** @import {MiserState, MiserResponse} from './miserengine.js' */

class MiserJS {

/** @type {MiserEngine} */
#miserEngine;
/** @type {MiserState} */
// @ts-ignore
#miserState;
/** @type {readline.Interface} */
// @ts-ignore
#rl;

    constructor() {
        this.#miserEngine = new MiserEngine();
    }

    async play() {
        let response;
        response = this.#miserEngine.newGame();
        this.#miserState = response.miserState;
        console.log(response.text);
        this.#rl = readline.createInterface({ input, output });
        this.#rl.setPrompt('');
        this.#rl.on('line', this.#processReadline.bind(this));
    }

    /**
     * 
     * @param {string} input 
     */
    async #processReadline(input) {
        let response;
        switch(input) {
            case 'quit':
                this.#rl.close();
                break;
            case 'save':
                await writeFile('miser-savegame.txt', JSON.stringify(this.#miserState, null, 4), 'utf8');
                console.log('Game saved.\n');
                break;
            case 'load':
                let jsonData =  await readFile('miser-savegame.txt', 'utf8');
                this.#miserState = JSON.parse(jsonData);
                console.log('Game restored.');
                response = this.#request('look');
                console.log(response.text);
                break;
            default:
                if (!input) return;
                response = this.#request(input);
                console.log(response.text);
        }
    }

    /**
     * 
     * @param {string} input
     * @returns {MiserResponse}
     */
    #request(input) {
        let response = this.#miserEngine.request(input, this.#miserState);
        this.#miserState = response.miserState;
        return response;
    }

    async speedrun() {
        this.#miserEngine = new MiserEngine();
        let response = this.#miserEngine.newGame();
        this.#miserState = response.miserState;
        console.log(response.text);
        
        let outputFile = await open('speedrun-output.txt', 'w');
        await outputFile.write(response.text, null, 'utf8');

        // Read commands from file.
        let commandFile = readFileSync('speedrun-commands.txt', 'utf8');
        // Strip the carriage returns (CR) and linefeeds (LF).
        commandFile = commandFile.replace(/[\r\n]+/g, '');
        const playerInput = commandFile.split(',');

        for (const command of playerInput) {
            console.log(`>> ${command}`);
            await outputFile.write(`\n>> ${command}\n`, null, 'utf8');
            response = this.#request(command);
            console.log(response.text);
            await outputFile.write(response.text, null, 'utf8');
        }

        await outputFile.close();
    }
}


let miserJS = new MiserJS();

let commandLineArgument = argv[2]?.trim();

if (!!commandLineArgument) {
    switch( commandLineArgument ) {
        case 'speedrun':
            miserJS.speedrun();
            break;
        default:
            console.log('Unrecognized command.');
            exit(1);
    }
} else {
    miserJS.play();
}
