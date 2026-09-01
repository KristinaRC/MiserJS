# MiserJS

## Play Online
![Screenshot of the MiserJS title screen.](https://github.com/user-attachments/assets/cf6ec7c3-139c-4568-8f7b-84a4031c7ad8 "Screenshot from MiserJS running in a web browser.")  
***( Screenshots from MiserJS running in a web browser. )***

This is a JavaScript port of the Miser text adventure game that was originally released in 1981 for the Commodore PET series of computers.

This is not an emulator or interpreter. The logic has been converted to modern JavaScript and will run natively in Node.js or a web browser.

MiserJS can be played online at the following link:
https://www.ragancomputing.com/miserjs

* ***No ads, analytics, trackers, or even a simple cookie!***
* You can save your game *locally* and continue it later.
* Type **save \[name\]** or just **save**. ( Brackets not required. )
* Type **load** to continue a saved game. (Multiple checkpoints supported.)
* Works offline without internet access after the initial load.
* Available to install as a Progressive Web App (PWA).
* Autosave enabled.
* Loads in under a second and only around 45,000 bytes transferred. 

## About the Core Code (miserjs-engine.js)

The game state object can be returned with a simple method call: getGameState().  
This allows for saving that object as a JSON string to anywhere that can accept string data: local file, browser local storage, a database field, Memcached, Redis, etc.

The game can be resumed later by providing the previously saved MiserState object to setGameState().

The ```dist/browser``` directory contains the engine for use in a web browser.  
There is a build script provided, ```npm run build``` that will minify and compress the plain miserjs-engine.js file in the ```src``` directory, placing the output in the ```dist/browser``` directory.

Brotli and Gzip compressed files are provided for use with brotli_static and gzip_static directives on the server, so the server doesn't have to re-compress on every request.  
* For Apache 2.4: [See doc here.](https://httpd.apache.org/docs/2.4/mod/mod_deflate.html#precompressed)
* For Nginx: [See doc here.](https://github.com/google/ngx_brotli) 

Run the build script after modifying the src files.

## Using the MiserEngine in your own front-end  

### For Node.js:
```
import MiserEngine from './miserjs-engine.js';
// Next is a JSDoc import statement for the object typedefs defined in MiserEngine.
// These will show the object properties and descriptions in your
// JavaScript IDE. (VS Code, WebStorm, Atom, etc.)
/** @import {MiserState, MiserResponse} from './miserjs-engine.js' */

// Start a new game.
// MiserEngine constructor can also take a previously saved MiserState object.  
let miserEngine = new MiserEngine();

let response = miserEngine.request('look');

// response will have a MiserResponse object with   
// output text from the Miser 'look' verb/command.
//
// You are in the front porch.
//
// There is a mat here.
//
// Obvious Exits:
// N 

// Print that returned game text:
console.log(response.text);

// Get input line string from player.

// Send the input line string.
response = miserEngine.request(input);

// Print the response text.
console.log(response.text)
```

In the simple front-end provided here - `miserjs-node.js` - I added  
`save` and `load` commands, which are not part of `miserjs-engine.js` .

All that does is JSON.stringify the MiserState object and
write it to a local file.

## Play Locally in Node.js

[Install Node.js](https://nodejs.org)  

1. [Download repo as zip file.](https://github.com/KristinaRC/MiserJS/archive/refs/heads/main.zip)
2. Extract the zip file.
3. cd MiserJS-main
3. node dist/node/miserjs-node

You're now playing the game as it was on the PET back in 1981.

I've added a few commands you can type at the prompt  
to support saving and restoring the game state:

`save` will save the game state to 'miserjs-savegame.txt'.  
`load` will load the game state from 'miserjs-savegame.txt'.  
`quit` will just exit the game without saving anything.

Type `score` to see current points and rank.

### Speed Run

You can also run `node dist/node/miserjs-node speedrun`.

This will speedrun the game using commands from  
the file ```speedrun-commands.txt```.

The output will be sent to the console and  
a file named ```speedrun/speedrun-output.txt```.

## About

I wrote this while thinking the code could provide someone with a starting point for their own text adventure game, or a variation
on Miser with additional rooms, floors, outdoor locations, etc. This is the reason why the code may seem overly commented. I wanted
to be as helpful as possible to someone relatively new to programming, or someone porting it to their own preferred language.

There are many ways to code a game like this more efficiently, in many different languages. Back when Mary wrote the original code,
she only had 16,384 bytes to work with, and much of that was character byte data. A freshly loaded game on a PET 4016 had a little less
than 400 bytes free. And of course it was BASIC, with a limited set of keywords and functions.

The fun part is coming up with a new way to implement an old-school BASIC text adventure game in a modern language, for computers
that should never 'busy wait' for player input. This could be a great exercise for students.

## Credits

Obviously, ***Mary Jean Winter***, the original author of Miser, which was released in 1981.

***There is no person named M.J. Lansing that is associated with this game!***

See the Wiki here for an explanation of how that name was mistakenly used in the source code of the original program.  
(**TLDR:** She was a Mathematics Professor at a college located in East Lansing, Michigan.)

I used the solution files found at The Classic Adventures Solution Archive  
for the speedrun-commands.txt file.

<u>Those files were provided by:</u>  
**Rene van Hasselaar**  
**Dennis Janssen**  
**Marco van Slageren**  
**'Alex'** (username at CASA)  

## Other ports
**Tom Croley** did a PC port of Miser in 1983.  
**Rene van Hasselaar** ported the 1983 Commodore 64 BASIC version of Miser to MS-DOS in 1999.  
**John Rumpelein** ported Miser to PHP in 2013. [(Link to his page about it.)](https://rumpelein.com/miser-text-adventure/)  
**Michael J. Fromberger**, [creachadair here on GitHub](https://github.com/creachadair/miser), ported Miser to [Chipmunk BASIC](https://www.nicholson.com/rhn/basic/) in 2018, so he could run it on his Macintosh.
