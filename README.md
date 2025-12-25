# MiserJS
JavaScript port of the Miser text adventure game that was originally released in 1981 for the Commodore PET series of computers.

## Background

*Miser* was programmed in Commodore PET BASIC, by Mary Jean Winter, and released in August 1981 as one of the programs featured in *CURSOR* cassette magazine, Issue #27 [(Direct to PDF, Page 63 at archive.org)](https://archive.org/download/cursor-issues/Cursor_Issues.pdf#page=63).

The printed cover sheet that came with the CURSOR #27 cassette shows Mary Jean Winter as the author of Miser.

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

I created a 'Miser Engine' which is stateless: send it a JSON string request containing a line of player input and the Miser program variable state, and it will send back a JSON string response with output text from the original game along with an updated variable state. Save the state however you like and send it back with every request. 

The frontend can be anything you want; all you have to do is get a line of player input and send it to the engine. You'll get a text string back that looks exactly like the output from the original 1981 program, complete with the newlines embedded.

I never published an NPM package before, so I'll have to learn that to make it easy to `npm install` in `node_modules`.

The ***Classic Adventures Solution Archive*** (https://solutionarchive.com/game/id%2C359/Miser.html), has more information about *Miser*, including other ports, maps, and a few game solution files.