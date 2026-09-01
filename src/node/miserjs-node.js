'use strict';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output, argv, exit } from 'node:process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { open, writeFile } from 'node:fs/promises';

import MiserEngine from '../engine/miserjs-engine.js';

/** @import {MiserState, MiserResponse} from '../engine/miserjs-engine.js' */

class MiserJS {

	/** @type {string} */
	#SAVEGAME_FILENAME = "miserjs-savegame.txt";

	/** @type {MiserEngine} */
	#miserEngine;
	/** @type {readline.Interface} */
	#rl;

	constructor() {
		this.#miserEngine = new MiserEngine();
	}

	async play() {
		// Could also restore a previously saved game.
		// let jsonData =  await readFileSync(this.#SAVEGAME_FILENAME, 'utf8');
		// this.#miserState = JSON.parse(jsonData);
		// console.log('Game restored.');
		console.log(this.#request('look').text);
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
		switch (input) {
			case 'save':
				await writeFile(this.#SAVEGAME_FILENAME, JSON.stringify(this.#miserEngine.getGameState(), null, 4), 'utf8');
				console.log('Game saved.\n');
				break;
			case 'load':
				let jsonData = readFileSync(this.#SAVEGAME_FILENAME, 'utf8');
				this.#miserEngine.setGameState(JSON.parse(jsonData));
				console.log('Game restored.');
				response = this.#request('look');
				console.log(response.text);
				break;
			default:
				if (!input) return;
				response = this.#request(input);
				if (response.gameOver) {
					switch (response.gameOver) {
						case 'died':
							console.log(response.text);
							this.#rl.close();
							break;
						case 'quit':
							response = this.#miserEngine.showFinalOutcome();
							console.log(`\n${response.text}\n`);
							this.#rl.close();
							break;
						case 'escaped':
							console.log(`\n${response.text}\n`);
							response = this.#miserEngine.showFinalOutcome();
							this.#rl.close();
							break;
					}
				} else {
					if (response.text.endsWith('\n')) {
						console.log(`${response.text}`);	
					} else {
						console.log(`${response.text}\n`);
					}
				}
		}
	}


	/**
	 * Send player input to MiserEngine.
	 * @param {string} input
	 * @returns {MiserResponse}
	 */
	#request(input) {
		return this.#miserEngine.request(input);
	}

	static async speedrun() {
		const miserEngine = new MiserEngine();
		const __dirname = import.meta.dirname;
		let text;

		// Read commands from file.
		let commandFilepath = path.join(__dirname, 'speedrun/speedrun-commands.txt');
		let commandFile = readFileSync(commandFilepath, 'utf8');
		// Strip the carriage returns (CR) and linefeeds (LF).
		commandFile = commandFile.replace(/[\r\n]+/g, '');
		const playerInput = commandFile.split(',');


		let outputFilepath = path.join(__dirname, 'speedrun/speedrun-output.txt');
		let outputFile = await open(outputFilepath, 'w');

		for (const command of playerInput) {
			console.log(`>> ${command}`);
			await outputFile.write(`\n>> ${command}\n`, null, 'utf8');
			text = miserEngine.request(command).text;
			console.log(text);
			await outputFile.write(text, null, 'utf8');
		}
		await outputFile.close();
	}
}

let miserJS = new MiserJS();

let commandLineArgument = argv[2]?.trim();

if (!!commandLineArgument) {
	switch (commandLineArgument) {
		case 'speedrun':
			await MiserJS.speedrun();
			exit(0);
			break;
		default:
			console.log('Unrecognized command.');
			exit(1);
	}
} else {
	miserJS.play();
}