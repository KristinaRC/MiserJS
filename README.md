# MiserJS
JavaScript port of the Miser text adventure game that was originally released in 1981 for the Commodore PET series of computers.

This is not an emulator or interpreter. The logic has been converted to modern JavaScript and will run natively in Node.js or a web browser.

The game state is returned in a simple JavaScript object after every player input. This allows for saving that object as a JSON
string to anywhere that can accept string data: local file, browser local storage, a database field, Memcached, Redis, etc.

This allows for a 'Miser session', similar to the stateless HTTP request-response cycle.
The game can be resumed later by including the previously saved MiserState object in the request.

I wrote this while thinking the code could provide someone with a starting point for their own text adventure game, or a variation
on Miser with additional rooms, floors, outdoor locations, etc. This is the reason why the code may seem overly commented. I wanted
to be as helpful as possible to someone relatively new to programming, or someone porting it to their own preferred language.

There are many ways to code a game like this more efficiently, in many different languages. Back when Mary wrote the original code,
she only had 16,384 bytes to work with, and much of that was character byte data. A freshly loaded game on a PET 4016 had a little less
than 400 bytes free. And of course it was BASIC, with a limited set of keywords and functions.

The fun part is coming up with a new way to implement an old-school BASIC text adventure game in a modern language, for computers
that should never 'busy wait' for player input. This could be a great exercise for students.

## Quick Start

1. git clone https://github.com/KristinaRC/MiserJS.git
2. cd MiserJS
3. node miserjs-{version}.js where version is x.y.z 

You're now playing the game as it was on the PET back in 1981.

I've added a few commands you can type at the prompt  
to support saving and restoring the game state:

`save` will save the game state to 'miserjs-savegame.txt'.  
`load` will load the game state from 'miserjs-savegame.txt'.  
`quit` will just exit the game without saving anything.

Type `score` to see current points and rank.

### Speed Run

You can also run `node miserjs speedrun`.

This will speedrun the game using commands from  
the file `speedrun-commands.txt`.

The output will be sent to the console and  
a file named `speedrun-output.txt`.

### Using the MiserEngine in your own front-end.

```
import MiserEngine from './miserengine-{version}.js'; // (x.y.z for version)
// Next is a JSDoc import statement for the object typedefs defined in MiserEngine.
// These will show the object properties and descriptions in your
// JavaScript IDE. (VS Code, WebStorm, Atom, etc.)
/** @import {MiserState, MiserResponse} from './miserengine-{version}.js' */

let miserEngine = new MiserEngine();
// Start a new game.
let response = miserEngine.newGame();

// response will have a fresh MiserState object and  
// output text from the Miser 'look' verb/command.
//
// You are in the front porch.
//
// There is a mat here.
//
// Obvious Exits:
// N 

// Save the returned MiserState in a variable.
let miserState = response.miserState;

// Get input line (string) from player.

// Send the input line (string) and previously saved MiserState.
response = miserEngine.request(input, miserState);
// Save MiserState for future requests.
miserState = response.miserState;
// Print the output text.
Example: console.log(response.text)
```

In the simple front-end provided here - `miserjs.js` - I added  
`save` and `load` commands, which are not part of `miserengine.js` .

All that does is JSON.stringify the response.miserState object and
write it to a local file.

### Credits
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

## Background

*Miser* was programmed in Commodore PET BASIC, by Mary Jean Winter, and released in August 1981 as one of the programs featured in *CURSOR* cassette magazine, Issue #27 [(Direct to PDF, Page 63 at archive.org)](https://archive.org/download/cursor-issues/Cursor_Issues.pdf#page=63).

The printed cover sheet that came with the CURSOR #27 cassette shows Mary Jean Winter as the author of Miser.  
[( See it here, at archive.org. )](https://archive.org/details/Cursor_Issue_01_thru_30/page/n62/mode/1up)

The BASIC program source code, at line 62005, mistakenly credited ***M.J. Lansing*** as the author, and this was shown on the title screen.

Later releases of Miser, in 1983, correctly attributed the author as ***M.J. Winter*** in the source code, and because of this, there was speculation on forums that Mary changed her name due to marriage. They just didn't see the CURSOR cover sheet from 1981, and were only referencing the BASIC source code listing and/or title screen.

M.J. (Mary Jean) Winter wrote several books on mathematical and computer related topics, such as 'The Commodore 64 Logo Book'. In that book, copyright 1983, she is described as
a professor in the mathematics department at Michigan State University: ***M.J. Winter, Ph.D., Professor of Mathematics, Michigan State University***.

Michigan State University is located in East ***Lansing***, Michigan.

Knowing that, there is an article she co-wrote from April 1978, which predates Miser by 3 years:

*The Arithmetic Teacher*  
Volume 25: Issue 7 : April 1978: Pages: 21–23  
A Calculator Activity That Teaches Mathematics  
Authors: Glenda Lappan and Mary Jean Winter

Digital Object Identifier:  
(Points to National Council of Teachers of Mathematics)  
https://doi.org/10.5951/AT.25.7.0021

I think someone at Code Works - publisher of CURSOR - just made a mistake and used Lansing instead of Winter while writing the BASIC source code for the title screen.

***[Lemon64.com](https://www.lemon64.com/)*** **member, ***'born2code'***, [relayed a message](https://www.lemon64.com/forum/viewtopic.php?p=697441) from Mary Jean Winter herself, on September 3, 2015:**

<blockquote>
I had an 8K (I cannot believe that number now) PET, with cassette player, and some magazine had an article on how to write such a program. Lots of the room names came from the stately homes in England that I had visited when on sabbatical and still had the guide booklets. I was a prof in the math dept of Michigan State and had just spent a year in London. We did a lot of touring on weekends. "RITNEW IS A CHARMING WORD" comes from my name.

As I said before, with 8K I was limited to one floor. (of the game),

I used to teach in a summer program for kids at MSU and one year our project (I had the advanced group that year) was to create a similar adventure game. Not exactly numerical analysis, but computers were a hobby.

I wrote a couple of games for the C64 (ah, there was a great machine). One was called Sea Route to India. Within the last 10 years someone published an anthology of C64 games, which he managed to make run on a PC, and Sea Route was among them. I wrote another game for the Vic which was a single screen where the moon moved through phases and a character moved on the screen. The screen was pretty complicated: a river, mountains, towns, etc. Certain actions had to be done in the dark of the moon. I've forgotten the name.

A company called Dataquest published books I wrote under the name of The Computer Playground, for the C64 and other machines.

At some point, I switched to an interest in Math Ed, with the appropriate use of technology (calculators at the time). With a math teacher at Plymouth Canton HS, wrote several books - Algebra Experiments, Geometry Experiments, etc.

I've been retired for years. Now spend half my time in France.

If you'd like to revise the game for the modern world, go ahead. But send me a copy, please. I'll send you my address.

Mary Winter
</blockquote>

Pretty neat - 34 years after she wrote the original program!

And here I am, in 2025, 44 years after the original was released, porting it to JavaScript so that it can be played in a browser, via the command line in Node.js, or via simple REST API.

In 2016, I ported Miser to the Universal Windows Platform (UWP), using C#, in order to learn the language and the platform in general. Then I ran the program on Windows 10 IoT running on a Raspberry Pi 3B, which didn't require a single line of changed code.

Since I had done most of the work already, I decided to translate that C# code to JavaScript and publish it on GitHub, so that others could port it to their favorite language, or maybe a language they were just starting to learn.

I created a 'Miser Engine' which is stateless. The front-end can be anything you want; all you have to do is get a line of player input and send it to the engine, along with the previously saved game state. You'll get a text string back that looks exactly like the output from the original 1981 program, complete with the newlines embedded.

I never published an NPM package before, so I'll have to learn that to make it easy to `npm install` in `node_modules`.

The ***Classic Adventures Solution Archive*** (https://solutionarchive.com/game/id%2C359/Miser.html), has more information about *Miser*, including other ports, maps, and a few game solution files.

### Article excerpt

[***COMPUTE!***, October 1982, Issue 29, Page 137 (archive.org, direct to page)](https://archive.org/details/1982-10-compute-magazine/page/137/mode/1up)  
Review: CURSOR: Issues 23 Through 28  
Marlene R. Pratto  
Greensboro, NC  

"One of the most congenial programs from these CURSOR issues is Miser, an adventure game. Miser was played continuously for two months at Erwin Open School, where it was the topic of both intense and casual conversations. Children exchanged information about what was hidden where. They used a thesaurus to look up alternative words when they could not make the computer take action. Some people think that personal computers will lead to fewer human conversations, but this program resulted in much conversation and cooperation.

Perhaps adventure style games have benefits beyond the social involvement and program solving. Because Miser and other adventure games have a restricted set of words that they understand, the player may know what to do, but not how to make the computer do it. This is similar to learning a programming language. The potential programmer may know what he/she wants the computer to do, but he/she must learn the words of the programming language used. Each computer language is a small subset of the language that humans know."

