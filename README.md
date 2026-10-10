# MiserJS
[![Clean Install, Build, Running All Tests](https://github.com/KristinaRC/MiserJS/actions/workflows/ci_build_test.yml/badge.svg)](https://github.com/KristinaRC/MiserJS/actions/workflows/ci_build_test.yml)
[![CodeQL](https://github.com/KristinaRC/MiserJS/actions/workflows/codeql.yml/badge.svg)](https://github.com/KristinaRC/MiserJS/actions/workflows/codeql.yml)
[![NPM Publish](https://github.com/KristinaRC/MiserJS/actions/workflows/publish.yml/badge.svg)](https://github.com/KristinaRC/MiserJS/actions/workflows/publish.yml)


## Play Online
![Screenshot of the MiserJS title screen.](https://github.com/user-attachments/assets/b737ba3e-36eb-4a39-bd37-66803c08e587 "Video capture and screenshots from MiserJS running in a web browser.")  
***( Video capture and screenshots from MiserJS running in a web browser. )***

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

## Using the MiserEngine in your own front-end  

### For Node.js 24.x and above:

1. ```cd``` to your front-end project directory, where you ran ```npm init```.
2. ```npm install miserjs```

(Type ```npx miserjs``` to play the game using the locally installed binary.)

```
import MiserJSEngine from 'miserjs';

// Start a new game.
// MiserEngine constructor can also take a previously saved MiserState object.  
let miserJSEngine = new MiserJSEngine();

let response = miserJSEngine.request('look');

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
response = miserJSEngine.request(input);

// Print the response text.
console.log(response.text)
```

A front-end example/starting-point is provided in    
```src/node/miserjs-node.js``` .

I added `save` and `load` commands that show how easy it is  
to save game progress to a local text file.

All that does is JSON.stringify() the MiserState object and
write/read it to/from a plain text file. 

The savegame file size is only around 1,000 (one thousand) bytes, in JSON form without whitespace.

### For a web browser:

The ```dist/browser``` directory contains the engine for use in a web browser:  
**```miserjs-engine-{version}.mjs```**  

That's the file you should copy to your web server public html directory.  

Put the following inside the HTML page <head></head> section, before your own front-end script that will import the engine:  
```<script defer src="miserjs-engine-{version}.mjs" type="module"></script>```  
(Your front-end script should also use 'defer' in the script tag, to be loaded after the engine, with both loading in parallel with the page load.)

In your front-end JavaScript code:
```import MiserJSEngine from "miserjs";```

Run the build script after modifying the engine src file, to generate a new set of dist files:  
```npm run build```

## Play Locally in Node.js

If you just want to play the game locally, in a terminal/console/PowerShell window:

[Install Node.js](https://nodejs.org)  

In a terminal or PowerShell:  
```npm install --global miserjs```

Then simply type:  
```miserjs```

You're now playing the game as it was on the PET back in 1981.

I've added a few commands you can type at the prompt  
to support saving and restoring the game state:

`save` will save the game state to 'miserjs-savegame.txt'.  
`load` will load the game state from 'miserjs-savegame.txt'.  
`quit` will just exit the game without saving anything.

Type `score` to see current points and rank.

### Speed Run

You can also run `miserjs speedrun`.

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

[See the Wiki](https://github.com/KristinaRC/MiserJS/wiki#the-history-of-miser) here for an explanation of how that name was mistakenly used in the source code of the original program.  
(**TLDR:** She was a Mathematics Professor at a college located in East Lansing, Michigan.)

***Andy Stadler***  
***Brian Sawyer*** (The Code Works, Cursor #27)  
***Glen Fisher*** (The Code Works, Cursor #27)

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
**Kelly Hall**, [grumble1965 here on GitHub](https://github.com/grumble1965/PythonMiser), ported Miser to Python in 2021.  
**robertorenz**, [here on Github](https://github.com/robertorenz/MiserRemake), created a '2.5D Remake' of Miser in 2026. Click the link to play it in your browser.

## Special Mentions

A review of Miser, from [Renga in Blue](https://bluerenga.blog/2020/03/04/miser-1981/) , which includes information about the CURSOR newsletter subscription service that ran from July 1978 to May 1982. Cursor #27 is where Miser was first released in August 1981.

That site is also a great source for fans of interactive fiction in general, especially the early years.

[Myles Skinner has a great page](https://tierceron.com/commodore/cursor/intro.php) about CURSOR tapes 1 through 24, with a link to the full set (1-30) of disk images that can be loaded into the [VICE Pet emulator](https://vice-emu.sourceforge.io) on a PC.