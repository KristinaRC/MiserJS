> Program starts here, and goes to Line 62000 to print the title screen.
```
0 pg$="miser":nm$="27":goto 62000
```
> Should be M.J. Winter, Ph.D., Professor of Mathematics,\
> Michigan State University, East Lansing, MI.
```
1 " m.j. lansing
2 " math dept msu
3 " e lansing, mi 48824
4 "
5 " cursor #27, aug, 1981
6 " copyright(c)1981 the code works
7 " box 550, goleta, ca. 93116
8 "
```
> <b>bs</b> is probably Brian Sawyer of The Code Works.\
> Programmer and author of various computer books.
```
10 " as of 81 aug 23 1:25 bs
```

<blockquote>
Main Program Start - Line 20.

`fna(x)` returns an `ol%` (object location) value based on the index provided by pt%(x).  
`pt%` is a pointer to the object's description in `om$()`.  

`wd` is probably for 'width'. Set to 40 by default, then checks  
to see if this PET has 80 columns by poking memory location 32768 with 96,  
and checking to see if 32768+1024 contains the same value.  
If it doesn't, this PET has an 80 column screen.  
</blockquote>

```
20 def fna(x)=ol%(pt%(x)):wd=40:poke 32768,96:if peek(33792) <> 96 then wd=80
```
> Allocate (DIMension) space for the arrays.
```
200 dim r$(48),r%(48,4),om$(28),ol%(28),v$(30),o$(30),pt%(30)
```
<blockquote>

`em` is 'error message'.\
`pf` is 'pool full'.\
`fb` is 'fire burning'.\
`h$(1)` and `h$(2)` define what to print when the program doesn't\
understand the player's input.

`em` is used to point to one of those 2 error messages in `h$()`.\
It alternates between the 2 messages via `em=3-em` every time an\
error message is printed.
</blockquote>

```
210 em=1:pf=1:fb=1:h$(1)="what?":h$(2)="i don't understand that."
```
---
<blockquote>

Data below is read into r%(48,4) integer array.\
The first 4 integers represent N,S,E,W in that order.\
This is the list of rooms and which rooms surround it.\
A (0) ZERO means you can't go that way.

The room descriptions get stored in the r$() string array.
</blockquote>

```
300 for i=0 to 48:for j=1 to 4:read r%(i,j):next j:read r$(i):next i
400 data 1,0,0,0,front porch
401 data 2,0,0,12,foyer to a large house. dust is everywhere
402 data 3,1,0,0,great hall. suits of armor line the walls
403 data 0,2,4,16,breakfast room. it is bright and cheery
404 data 0,5,7,3,conservatory. through a window you see a hedge-maze
405 data 4,6,0,0,red-walled room
406 data 5,0,10,0,formal parlor
407 data 0,0,8,4,green drawing room
408 data 0,9,0,7,trophy room. animal heads line the walls
409 data 8,0,0,10,den
410 data 0,11,9,6,blue drawing room
411 data 10,0,0,0,library. empty shelves line walls
412 data 0,0,1,13,dining room
413 data 15,0,12,0,chinese room
414 data0,0,0,0,$
415 data23,13,16,0,kitchen. it is bare
416 data0,0,3,15,pantry. dust covers the mahogany shelves
417 data0,8,0,18,game room
418 data21,0,17,19,smoking room. the air is stale in here
419 data21,0,18,20,portico. a murky pool glimmers on the south side
420 data21,21,19,19,hall of mirrors - a good place to reflect
421 data0,19,0,20,ballroom. it has a beautiful wood dance floor
// 'religious' is misspelled as 'religous' in the original 1981 program listing.
422 data0,0,0,21,chapel. a tablet says 'drop a religious item or die!!'
423 data24,15,40,25,back yard
424 data24,23,24,24, back yard
425 data26,0,23,0,pool area. there is a large swimming pool here
426 data0,25,0,0,pump house. there is pool machinery installed here
427 data35,0,31,28,middle of the western hallway
428 data0,0,27,0,west bedroom
429 data39,0,0,0,front balcony. there is a large road below
430 data0,0,0,0,$
431 data0,0,38,27,master bedroom. there's a huge four-poster bed
432 data0,36,0,0,rear balcony. below you see a hedge maze
433 data34,0,0,38,east bedroom
434 data0,33,0,0,closet
435 data0,27,36,0,junction of the west hallway and the north-south hallway
436 data32,0,37,35,center of the north-south hallway
437 data0,38,0,36,junction of the east hallway and the north-south hallway
438 data37,39,33,31,middle of the east hallway
439 data38,29,0,0,south end of the east hallway
440 data0,42,0,41,hedge maze
441 data44,42,0,0,hedge maze
442 data41,44,43,0,hedge maze
443 data41,23,0,0,hedge maze
444 data0,42,0,45,hedge maze
445 data0,0,44,0,hedge maze // Golden leaf location
446 data0,0,0,5,walk-in vault
447 data0,40,0,0,dungeon. there is light above and to the south
448 data0,0,0,0,bottom of the swimming pool. a ladder leads up and out
```
> Define all the verbs that can be used in the game.
```
500 for i=1 to 30:read v$(i):next i
510 data get,take,move,slid,push,open,read,inve,quit // 1-9
511 data drop,say,pour,fill,unlo,look // 10-15
512 data go,nort,n,sout,s,east,e,west,w,scor,turn,jump,swim,i,fix // 16-30
```
<blockquote>
<<<<<<< HEAD
Define objects and object pointer.\

The o$ array uses the first 4 characters of the object name to save\
memory space.\
=======

Define objects and object pointer.

The o$ array uses the first 4 characters of the object name to save\
memory space.
>>>>>>> 2c15a0e (Add annotated source code for the original 1981 version.)

The player input is matched to only these 4 characters, so 'ripcage'\
would match 'ripcord' anyway.  
</blockquote>

```
550 for i=1 to 30:read o$(i), pt%(i):next i
560 data ripc,17,mat,10,pape,13,buck,1,swor,9,key,20,valv,-1,ladd,-1 // Objects 1-8
570 data slip,19,rug,15,book,23,door,-1,cabi,-1,ritn,-1,vict,-1,orga,-1,para,14 // Objects 9-17
580 data stai,-1,penn,12,cros,11,leaf,4,bag,5,\>\$\<,-1,\>$\<,-1,ring,7,pain,8 // Objects 18-26
590 data vaul,-1,pool,-1,xyzz,-1,plug,-1 // Objects 27-30
```
> Define object moniker, object location
```
600 for i=1 to 28:read om$(i),ol%(i):next i:print"{clr}" 
610 data plastic bucket,26,vicious snake,4,charmed snake,-2,\*golden leaf\*,45
611 data \*bulging moneybag\*,46,>$\<,-2,\*diamond ring\*,48
612 data \*rare painting\*,39,sword,13,mat,0,rusty cross,23,penny,28
613 data piece of paper,31,parachute with no ripcord,34,oriental rug,6
614 data trapdoor marked 'danger',-2
615 data parachute ripcord,-2,portal in the north wall,-2
616 data pair of \*ruby slippers\*,-2,brass door key,-2
617 data majestic staircase leading up,2
618 data majestic staircase leading down,27,battered book,11
619 data organ in the corner,21,open organ in the corner,-2
620 data cabinet on rollers against one wall over,5,repaired parachute,-2
621 data "sign saying 'drop coins for luck'",19
// Now go to 14000, ‘LOOK’ command.
// Many of the commands will execute a 'goto 699' after they are done
// updating variables, so that the player sees what changed.
699 goto 14000
```
<blockquote>

Arrays start at Index 0 (Zero) in PET BASIC, but she stores\
the data in indices starting at 1 (ONE).

`ol%` contains integers which sometimes point to one of the rooms\
listed in lines 400 through 448. (cp value)\
-1 = carrying the item\
-2 = hidden

|Index| v$ | o$ |pt%|ol%|              om$                       |
|:---:|:--:|:--:|:-:|:-:|:--------------------------------------:|
|1    |get |ripc|17 |26 |plastic bucket                          |
|2    |take|mat |10 |4  |vicious snake                           |
|3    |move|pape|13 |-2 |charmed snake                           |
|4    |slid|buck|1  |45 |\*Golden Leaf\*                         |
|5    |push|swor|9  |46 |\*Bulging Moneybag\*                    |
|6    |open|key |20 |-2 |\>$\<                                   |
|7    |read|valv|-1 |48 |\*Diamond Ring\*                        |
|8    |inve|ladd|-1 |39 |\*Rare Painting\*                       |
|9    |quit|slip|19 |13 |sword                                   |
|10   |drop|rug |15 |0  |mat                                     |
|11   |say |book|23 |23 |rusty cross                             |
|12   |pour|door|-1 |28 |penny                                   |
|13   |fill|cabi|-1 |31 |piece of paper                          |
|14   |unlo|ritn|-1 |34 |parachute with no ripcord               |
|15   |look|vict|-1 |6  |oriental rug                            |
|16   |go  |orga|-1 |-2 |trapdoor marked 'DANGER'                |
|17   |nort|para|14 |-2 |parachute ripcord                       |
|18   |n   |stai|-1 |-2 |portal in the north wall                |
|19   |sout|penn|12 |-2 |pair of \*Ruby Slippers\*               |
|20   |s   |cros|11 |-2 |brass door key                          |
|21   |east|leaf|4  |2  |majestic staircase leading up           |
|22   |e   |bag |5  |27 |majestic staircase leading down         |
|23   |west|>$< |-1 |11 |battered book                           |
|24   |w   |>$< |-1 |21 |organ in the corner                     |
|25   |scor|ring|7  |-2 |open organ in the corner                |
|26   |turn|pain|8  |5  |cabinet on rollers against one wall over|
|27   |jump|vaul|-1 |-2 |repaired parachute                      |
|28   |swim|pool|-1 |19 |sign saying 'Drop coins for good luck'  |
|29   |i   |xyzz|-1 |   |                                        |
|30   |fix |plug|-1 |   |                                        |
</blockquote>

---
> Subroutine to parse the IN$ input line obtained from GOSUB 60000.
```
700 print:sc=0:sf=0:gosub 60000:if len(in$)=0 then 700
720 if left$(in$,1)=" " then in$=right$(in$,len(in$)-1):goto 720 // Strip leading spaces
730 if right$(in$,1)=" " then in$=left$(in$,len(in$)-1):goto 730 // Strip trailing spaces
735 sp=len(in$)+1:print
740 sc=sc+1:if mid$(in$,sc,1)=" " then sf=sf+1:sp=sc
750 if sc<len(in$) then 740
760 if s>-1 and sf<2 then goto 780
770 print "please type a one or two word command":goto 700
780 cv$=left$(in$,sp-1):for x=1 to 30:if left$(cv$,4)=v$(x) then i=x:goto800
// Didn't understand the verb, so goes to 50000 to print "what?" or "i don't understand that"
790 next x:goto 50000 
800 if sf=0 then co$="":j=0:goto 900
810 co$=mid$(in$,sp+1,4):for x=1 to 30:if co$=o$(x) then j=x:goto 900
820 next x:goto 50000
830 goto 700

// Variables i and j are used here.
// i = first word from input line. The 'verb' Values from 1 to 30
// j = second word from input line. The 'object' to act on Values from 1 to 30
// There are a total of 30 verbs defined in v$(30), so the following
// lines have a goto for every single verb in that string array.
// For example, 'on i goto 1000' would goto 1000 if the verb was 1, which is "get" from v$(1).
// j will have the index of the object in o$() to act on.

900 on i goto 1000,1000,2000,2000,2000,4000,5000,6000,7000,8000,9000,10000
910 on i-12 goto 11000,12000,14000,15000,16000,16000,17000,17000,17010,17010
920 on i-22 goto 19000,19000,20000,21000,22000,24000,6000,25000
```
---
<blockquote>

## Get / Take command.
i = 1 which means v$(1) or "get"\
i = 2 which means v$(2) or "take"
j = object index in o$()
</blockquote>

```
// Get with no object (j=0). Doesn't understand.
1000 if j=0 then 50000
// Object cannot move (-1).
1002 if pt%(j)=-1 then print "i am unable to do that.":goto 700
// -1 in ol%(pt%(j)) means the object has already been picked up.
1005 if fna(j)=-1 then print "you're already carrying it":goto 700 
// object not at cp 'current position', so print a message.
1010 if fna(j)<>cp then 51000
// Set ol%(pt%(j)) to -1 to indicate object has been picked up.
1020 ol%(pt%(j))=-1:print "ok"
// Check if it's a special object (treasure). o$(4,5,7,8,19).
1030 x=pt%(j):if (x>3 and x\<9) or x=19 then print"you got a treasure!":gt=gt+1
// Special case for the mat. Set object location to front porch, r$(0).
1040 if j=2 and ol%(20)=-2 then print "you find a door key!":ol%(20)=0 
1050 goto700
```
---
<blockquote>

## Move / Slide / Push.

i = 3 which means v$(3) or "move"\
i = 4 which means v$(4) or "slide"\
i = 5 which means v$(5) or "push"\
j = object index in o$()
</blockquote>

```
// (move,slide,push) with no object. Doesn't understand.
2000 ifj=0then50000

// A bug in the original program here.
// The cabinet should not move after the first time, which reveals the vault.
// Should check for FV here instead of r%(5,3), because r%(5,3)=0 means the vault isn’t open.
// "(move,slide,push) cabinet" reveals the vault at 2100.
2005 ifj=13andcp=5and r%(5,3)=0 then 2100 
// This next line will print ‘That item stays put.’, even if the object isn’t at the current position (CP).
// This reveals objects to the player before they are ever encountered in the game.
//
// There is no way to check if the object is at the current position (cp) because\
// the value of pt\[j\] is used as an index into the ol%() array, and ol%(-1) is invalid.
2010 if pt%(j)=-1 then print"that item stays put.":goto700
// If object not at the current position AND not carrying it, goto 51000.
2020 if(fna(j)\<\>cp)and(fna(j)\<\>-1)then51000 
2030 ifj=2andol%(20)=-2then1040
2040 ifj=10andol%(16)=-2then2200
2050 print"moving it reveals nothing."
2060 goto700
2100 print"behind the cabinet is a vault!"
2110 fv=1:goto699 // fv means 'found vault'
2200 print"you find a trap door!"
2210 ol%(16)=6:goto699
```
---
<blockquote>

## Open command.

i = 6 which means v$(6) or "open"
j = object index in o$()
</blockquote>

```
// No object or second word, nothing to open.
4000 if j=0 then 50000
4002 if j<>11 then 4030
// Open book.
4005 if ( fna(j)<>cp ) and ( fna(j)<>-1 ) then 4030
4010 in$="scrawled in blood on the inside front cover is the message,"
4011 gosub 53000:print
4020 print"''victory' is a prize-winning word'.":goto 700
// Open valve.
4030 if j=7 then print "try turning it.":goto700
4040 if j<>12 then 4120
// Open door.
4050 if cp=0 and du=0 then print "sorry, the door is locked.":goto700
4060 if cp=0 and du then print "it's already open.":goto700
4070 if cp<>6 then 51000
// Open trapdoor.
// This could be a bug. You can open the trapdoor before you move the\
// oriental rug to reveal it.
// Maybe there should be a ft (Found Trapdoor) variable to check for this?
// All versions of this program that followed have it this way.
4080 in$="you open the door. you lean over to peer in, and you fall in!"
// Update current position to the dungeon, r$(47).
4090 gosub 53000:cp=47:print:goto 699
4120 if j<>13 then 4160
// Open cabinet.
4130 if ol%(26)<>cp then 51000
4140 print "the cabinet is empty and dusty."
4150 in$="scribbled in dust on one shelf are the words, 'behind me'."
4155 gosub53000:print:goto 700
4160 if j<>22 then 4190
// Open bag.
4170 if fna(j)<>cp and fna(j)<>-1 then 51000
4180 print"the bag is knotted securely.":print"it won't open.":goto 700
4190 if j<>27 then 4230
// Open vault.
4200 if cp<>5 or fv=0 then 51000
4210 if vo then print "it's already open.":goto 700
4220 print "i can't, it's locked.":goto 700
4230 if j<>16 then print "i don't know how to open that.":goto 700
// Open organ.
4232 if cp<>21 then 51000
4235 if gg=0 then print"it's stuck shut.":goto 700
4240 if ol%(24)=-2 then print "it's already open.":goto 700
4250 print "as you open it, several objects":print "suddenly appear!"
4260 ol%(24)=-2:ol%(25)=21:ol%(19)=21:ol%(17)=21:goto 699
```
---
<blockquote>

## Read command.

i = 7 which means v$(7) or "read"
j = object index in o$()
</blockquote>

```
5000 if j=0 then 50000
5005 if pt%(j)>-1 then if fna(j)<>cp and fna(j)<>-1 then 51000
5010 if pt%(j)=-1 then print "there's nothing written on that.":goto 700
5020 if j<>3 and j<>11 then print "there's nothing written on that.":goto 700
5030 if j=11 then print "the front cover is inscribed in greek.":goto 700
5040 print "it says, '12-35-6'.":print "hmm.. looks like a combination."
5050 kc=1:goto 700
```
---
<blockquote>

## Inventory command.

i = 8 which means v$(8) or "inve" (inventory)
i = 29 which means v$(29) or "i" (inventory)
</blockquote>

```
// {down} is 'cursor down' in PET BASIC.
6000 print "you are carrying the following:{down}"
6010 fi=0:for x=1 to 27:if ol%(x)=-1 then print om$(x):fi=1
6020 if x=1 and bf and ol%(1)=-1 then print " the bucket is full of water."
6025 if x=14 and ol%(14)=-1 then print" (better fix it)"
6030 next x:if fi=0 then print "nothing at all."
6040 goto700
```
---
<blockquote>

## Quit command.

i = 9 which means v$(9) or "quit"
</blockquote>

```
7000 print"do you really want to quit now?"
7001 gosub 60000:if in$="" then 7001
7002 if left$(in$,1)<>"y" then print:print"{down}ok":goto 700
// Clear screen.
7005 print"{clr}"
7010 print"{down}you accumulated";gt;"treasures,"
7020 print"for a score of";gt*20;"points."
7030 print"(100 possible)":if es=0 then print"{down}however, you did not escape."
7040 print"{down}this puts you in a class of:":if es then gt=gt+1
7050 on gt+1goto7060,7070,7075,7090,7100,7110,7115
7060 print"\<beginner adventurer>":goto7120
7070 print"\<amateur adventurer>":goto7120
7075 print"\<journeyman adventurer>":goto7120
7090 print"\<experienced adventurer>":goto7120
7100 print"\<pro adventurer>":goto7120
7110 print"\<master adventurer>":goto7120
7115 print"\<grandmaster adventurer>"
7120 if gt<>6 then print"{down}better luck next time!"
7150 end
```
---
<blockquote>

## Drop command.

i = 10 which means v$(10) or "drop"
</blockquote>

```
BUG: If you try to DROP one of the objects that has
a -1 in the PT%(J) value, it will result in a
“?ILLEGAL QUANTITY ERROR IN LINE 8000”. The program will end,
and the Commodore Basic CONT (continue) command will not work
to continue the game.
Valve, Ladder, Door, Cabinet,Ritnew, Victory, Organ, Stairs,
Vault, Pool, Xyzzy, Plugh
There are checks for a -1 in PT%(J) during processing of several
other commands, like ‘READ’ above at lines 5000-5010:
    5000 ifj=0then50000 // No second word
    5005 if pt%(j)>-1 then if fna(j)<>cp and fna(j)<>-1 then 51000
    5010 if pt%(j)=-1 then print "there's nothing written on that.":goto 700
This program took up almost all of the memory available to BASIC
on a PET with 16K (free bytes under 400), so another check could have
been left out on purpose to save space.

8000 if fna(j)<>-1 then print "you aren't carrying it!":goto 700
8010 x=pt%(j):if (x>3andx\<9) or x=19 then print"don't drop *treasures*!":goto 700
8020 if cp=19 and j=19 then 8100 // Portico (cp=19) and Penny (j=19=o$(19))
8030 if cp=22 and j=20 then 8200 // Chapel and Cross

8040 ol%(pt%(j))=cp:print"ok":goto700

8100 in$="as the penny sinks below the surface of the pool, a fleeting image of"
8110 gosub 53000:print:print "a chapel with dancers outside appears."
8130 r%(21,3)=22:ol%(12)=-2:goto 700
8200 in$="even before it hits the ground, the cross fades away!":gosub 53000:print
8210 print"{down}the tablet has disintegrated."
8215 print"{down}you hear music from the organ."
8220 gg=1:ol%(11)=-2:r$(22)="chapel"
8221 om$(24)="closed organ playing music in the corner":goto 700
```
---
<blockquote>

## Say command.

i = 11 which means v$(11) or "say"
</blockquote>

```
9000 ifj=0thenprint"say what???":goto700
9010 ifj=14then9100
9020 ifj=15then9200
9030 ifj>28then9300
9040 print"okay, '";right$(in$,len(in$)-sp);"'."
9050 forx=1to1000:nextx:print"nothing happens.":goto700
9100 ifcp\<\>4orchthenprint"nothing happens.":goto700
9110 in$="the snake is charmed by the very utterance of your words."
9111 gosub53000:print
9120 ch=1:ol%(2)=-2:ol%(3)=4:goto700
9200 if cp<>8 or po then print"nothing happens.":goto700
9210 print"a portal has opened in the north wall!!"
9220 po=1:r%(8,1)=17:ol%(18)=8:goto700
9300 print"a hollow voice says, 'wrong adventure'.":goto700
```
---
<blockquote>

## Pour command.

i = 12 which means v$(12) or "pour"
</blockquote>

```
10000 if j<>4 then print "i wouldn't know how.":goto 700
// Pour bucket.
10010 if ol%(1)<>-1 and ol%(1)<>cp then 51000
10020 if bf=0 then print "the bucket is already empty.":goto 700
10030 if cp=19 then print "ok":goto 700
10040 if cp<>10 or fb=0 then print "the water disappears quickly.":bf=0:goto 700
10050 print "congratulations! you have vanquished":print "the flames."
10060 fb=0:bf=0:goto 699
```
---
<blockquote>

## Fill command.

i = 13 which means v$(13) or "fill"
</blockquote>

```
11000 if j=0 then 50000
11010 if pt%(j)=-1 then print "that wouldn't hold anything.":goto 700
11020 if fna(j)<>cp and fna(j)<>-1 then 51000
11030 if j<>4 then print "that wouldn't hold anything.":goto700
// Fill bucket.
11040 if bf then print "it's already full.":goto 700
11050 if cp=25 and pf then print"i'd rather stay away from the mercury.":goto 700
// Check if in backyard or portico.
11060 if cp<>23 and cp<>19 then print "i don't see any water here.":goto 700
11070 print "your bucket is now full.":bf=1:goto 700
```
---
<blockquote>

## Unlock command.

i = 14 which means v$(14) or "unlock"
</blockquote>

```
12000 if j=0 then 50000
// Only the door and vault can be unlocked.
12010 if j<>12 and j<>27 then print "i wouldn't know how to unlock one.":goto 700
// Only in front porch, red-walled room, and formal parlor.
12020 if cp<>0 and cp<>5 and cp<>6 then 51000
// Front porch and door.
12030 if cp=0 and j=12 then 12200
// Red-walled room and vault.
12040 if cp=5 and j=27 then 12300
// Check for trapdoor.
12050 if cp<>6 or j<>12 or ol%(16)=-2 then 51000
12100 print "the trapdoor has no lock":goto 700
12200 if du then print "it's already unlocked.":goto 700
12210 if ol%(20)<>-1 then print "i need a key.":goto 700
12220 print "the door easily unlocks and swings open.":du=1:goto 699
12300 if vo then print "it's already open.":goto 700
12305 if fv=0 then 51000
12310 if kc=0 then print "i don't know the combination.":goto700
12320 print"ok, let's see. 12..35..6..":print "\<click!> the door swings open."
12330 vo=1:r%(5,3)=46:goto 699
```
---
<blockquote>

## Look command.

i = 15 which means v$(15) or "look"
</blockquote>

```
// Player status update. Location, Objects in sight, etc.
//
// cp = "CURRENT POSITION"
//
// Line 14000 tells the player where they are
// Gosub 53000 just formats/prints the IN$, handles text wrapping
//
14000 in$="{down}you are in the "+r$(cp)+".":gosub 53000:print
// Lines 14010 through 14030 prints the list of all objects at this location (CP variable)
// Should go to 14030 instead of 14020, to avoid an unnecessary check at 14020
14010 for x = 1 to 28:if ol%(x)<> cp then 14020 
14011 in$="there is a "+om$(x)+" here.":print:gosub 53000:print
// Special case for bucket - If bucket is in the Pump House where the player is (CP=26) and it is full (bf not 0)
14020 if x=1 and bf and ol%(1)=cp then print " the bucket is full of water."
14030 next x
// Special case for pool area
14040 if cp=25 and pf then print "{down}the pool is full of liquid mercury!"
 // Not in pool area or pool full (PF)
14050 if cp<>25 or pf then 14060
goto 14060
// Reach 14055 if in pool area and the pool is not full (PF=0)
// Checks object location for object #7, which is the diamond ring.
// 48 means it's in the pool. Anything else means the player picked it up already.
14055 print"{down}the pool's empty.":if ol%(7)<>48 then 14060
14056 print "{down}i see something shiny in the pool!"
// If player isn't in Blue Drawing Room (CP not equal to 10), or the fire isn’t burning (FB=0), goto 14090.
14060 if cp<>10 or fb=0 then 14090
 // Player is in Blue Drawing Room with a full bucket
14070 print"{down}there is a hot fire on the south wall!"
14080 print"if i go that way i'll burn to death!"
// If not in pantry goto 14110
14090 if cp<>16 then 14110
// In Pantry here cp=16
14100 in$="{down}a rich, full voice says, 'ritnew is a charming word'."
// Can skip over the next 7 checks for cp, and goto 14130.
14105 gosub 53000:print
// If in pump house
14110 if cp=26 then print"{down}there is a valve on one of the pipes."
// If in backyard
14115 if cp=23 then print"{down}there is a leaky faucet nearby."
 // If in blue drawing room and bucket of water was thrown on the wall (fb=0)
14120 if cp=10 and fb=0 then print"{down}there is evidence of a recent fire here."
 // If in red-walled room
14125 if cp=5 and fv then print"{down}there is a vault in the east wall."
// If in red-walled room and the vault was opened (vo true)
14126 if cp=5 and vo then print "the vault is open."
 // If on front porch and door unlocked (DU)
14127 if cp=0 and du then print"{down}an open door leads north."
// If not on the bottom of the swimming pool
// If any of the N S E W numbers from r%(CP, 1 2 3 or 4) are greater than 0, print that direction
14130 if cp<>48 then print"{down}obvious exits:":if r%(cp,1)>0 then print"n "; 
14140 if r%(cp,2)>0 then print "s ";
14150 if r%(cp,3)>0 then print"e ";
14160 if r%(cp,4)>0 then print"w ";
14170 print:goto 700
```
---
<blockquote>

## Go command.

i = 16 which means v$(16) or "go"
</blockquote>

```
15000 if j<>8 and j<>18 and j<>28 then 50000
15010 if (j=8 and cp<>48) or (j=18 and cp<>2and cp<>27) or (j=28 and cp<>25) then 51000
// Go ladder.
15020 ifj=8 then cp=25:goto 699
// Go pool, but pool is full..
15030 if j=28 and pf then print"the pool is full of mercury!":goto 700
// Go pool, and pool is empty.
15040 if j=28 then cp=48:goto 699
// Go stairs.
15050 if cp=27 then cp=2:goto 699
// Go stairs with sword.
15060 if ol%(9)=-1 then 15070
// Go stairs without sword.
15061 in$="the suits of armor prevent you from going up!":gosub 53000
15062 print:goto700
15070 print"the suits of armor try to stop you,"
15080 print"but you fight them off with your sword.":cp=27:goto 699
```
---
<blockquote>

## North command.

i = 17 which means v$(17) or "nort" (north)
i = 18 which means v$(18) or "n" (north)
</blockquote>

```
16000 if cp=0 and du=0 then print "the door is locked shut.":goto 700
16010 if r%(cp,1)=0 then 52000
16015 if cp=0 then print"{down}the door slams shut behind you!"
16020 cp=r%(cp,1):goto 699
```
---
<blockquote>

## South command.

// i = 19 which means v$(19) or "sout" (south)

// i = 20 which means v$(20) or "s" (south)
</blockquote>

```
// Shocking ending...just get dropped back to BASIC.
17000 if cp=10 and fb then print "you have burnt to a crisp!":end
```

<blockquote>

## East command.

i = 21 which means v$(21) or "east" (east)
i = 22 which means v$(22) or "e" (east)
</blockquote>

```
17010 if cp=4 and ch=0 and ps=0 then print "the snake is about to attack!":ps=1:goto 700
17020 if cp=4 and ch=0 then print "the snake bites you!":print"you are dead.":end
17030 d=2:if i=21 or i=22 then d=3
17040 if r%(cp,d)=0 then 52000
17050 cp=r%(cp,d):goto 699
```
---
<blockquote>

## West command.

i = 23 which means v$(23) or "west" (west)
i = 24 which means v$(24) or "w" (west)
</blockquote>

```
// Cannot go west.
19000 if r%(cp,4)=0 then 52000
19010 cp=r%(cp,4):goto699
```
---
<blockquote>

i = 25 which means v$(25) or "score"
</blockquote>

```
20000 print:print"if you were to quit now,":print"you would have a score of";
20010 print gt*20;"points.":print"(100 possible){down}"
20020 print"do you indeed wish to quit now? ";
20030 gosub60000
20040 print:if left$(in$,1)="y" then 7010
20050 if left$(in$,1)<>"n" then print "please answer yes or no":goto 20020
20060 print "ok":print:goto 700
```
---
<blockquote>

## Turn command.

i = 26 which means v$(26) or "turn"
</blockquote>

```
21000 if j<>7 then print "i don't know how to turn such a thing.":goto 700
21010 if cp<>26 then 51000
21020 in$="with much effort, you turn the valve 5 times. you hear the sound "
21030 in$=in$+"of liquid ":gosub 53000:print:print"flowing through pipes."
// Toggle Pool Full (pf)
21040 pf=1-pf
// These next 2 lines are not necessary. ol%(7) will never be -3 or 25.
// ol%(7) can only be 48 (Bottom of swimming pool) or -1 (Carrying it/Picked up)
// ol%(7) means 'object location of the diamond ring (7)'
// I’m guessing that this was early code to make the diamond ring
// appear in the pool area (cp=25, ol%(7)=25, 25 is the pool area), or disappear (-3).
21050 if pf=0 and ol%(7)=-3 then ol%(7)=25:goto 700
21060 if pf and ol%(7)=25 then ol%(7)=-3:goto 700
21070 goto 700
```
---
<blockquote>

## Jump command.

i = 27 which means v$(27) or "jump"
</blockquote>

```
22000 if cp<>27 and cp<>29 and cp<>32 then print "there's nowhere to jump.":goto 700
22010 print "you jump..":if cp= 27 then 22500
22020 if ol%(14)=-1 then 22100
22030 if ol%(27)=-1 then 22200
22040 print"you hit the ground.":goto22540
22100 print "there is no way to open the parachute!":goto22040
22200 print"you yank the ripcord and the"
22210 print"'chute comes billowing out.":if cp=32 then cp=40:goto 699
22220 print"you land safely":print"{down}congratulations on escaping!":es=1:goto 7010
22500 if jm then 22530
22510 print"you have landed down-stairs,":print"and narrowly escaped serious"
22520 print"injury. please don't try it again.":jm=1:cp=2:goto 699
22530 print"now you've done it. you ignored":print "my warning, and as a result"
22540 print "you have broken your neck!":print "{down}you are dead.":end
```
---
<blockquote>

## Swim command.
i = 28 which means v$(28) or "swim"
</blockquote>

```
24000 if cp<>19 and cp<>25 then print "there's nothing here to swim in!":goto 700
// In portico.
24010 if cp=19 then print "the water is only a few inches deep.":goto 700
// In pool area.
24020 if pf then print "in mercury? no way!":goto 700
24030 print "the pool is empty.":goto 700
```
---
<blockquote>

## Inventory command.

i = 29 which means v$(29) or “i”.

Handled above at Line 6000, i=8, v$(8)='inve'.
</blockquote>

---
<blockquote>

i = 30 which means v$(30) or "fix"
j = integer index into o$ array, the object to act on.
</blockquote>

```
25000 if j=0 then 50000
// Fix valve.
25010 if j=7 then print "i ain't no plumber.":goto 700
25020 if j<>17 then print "i wouldn't know how.":goto 700
// Fix parachute.
25030 if fna(j)<>cp and fna(j)<>-1 then 51000
25040 if ol%(14)=-2 then print "it's already fixed.":goto 700
25050 if ol%(17)<>-1 then print "i need a ripcord.":goto 700
25060 print "i'm no expert, but i think it'll work."
25070 ol%(27)=ol%(14):ol%(14)=-2:pt%(17)=27:ol%(17)=0:goto 700
```
---
<blockquote>

## Subroutines.

</blockquote>

---
<blockquote>

### Gosub 50000

50000 prints the "What?" or "I don't understand" line.

It alternates between them based on the `em` variable being either 1 or 2\
as an index into the `h$` array.

`em` starts at 1, so the first string to be output is h$(1) which is "What?".

`em=3-em` sets it to 2 for the next time here, to print "I don't understand".
</blockquote>

```
50000 print h$(em):em=3-em:goto700
```
---
<blockquote>

### Gosub 51000

Tried to do something with an object that isn't in the current room (cp).
</blockquote>

```
51000 print "i don't see it here.":goto 700
```
---
<blockquote>

### Gosub 52000

Tried to go in a direction defined as 0 (ZERO) in r%(room number, N, S, E, W).
</blockquote>

```
52000 print"it's impossible to go that way.":goto700
```
---
<blockquote>

### Gosub 53000

Text output routine.

This subroutine handles wrapping of the IN$ output for 40 character wide screens.
</blockquote>

```
53000 if len(in$)\<=40 or wd=80 then print in$;:return
53005 oe=41
// This tests character index 41 in in$ for a space, and if it's a
// letter, backs up until it finds a space.
53010 if mid$(in$,oe,1)<> " " then oe=oe-1:goto 53010
53020 print left$(in$,oe):print right$(in$,len(in$)-oe);:return
```
---
<blockquote>

### Gosub 60000

This subroutine is for getting a line of text from the player.\
It handles the cursor blinking, echoing input, line editing, etc.

`ti` is a Commodore PET BASIC variable which holds the number of\
1/60 second ticks (jiffies) since the program started.

zd$ is set to the ‘delete’ character, PETSCII number 20.
</blockquote>

```
60000 in$=" ":zt=ti:zc=2:zd$=chr$(20)
// If a character is entered, goto 60070 to handle it
60010 get z$:if z$<>"" then 60070
// Otherwise show the cursor block every 15 jiffies, for 15 jiffies
// (250ms) (1 jiffy = 1/60 second)
60020 if zt<=ti then print mid$("{CBM-+}",zc,1);"{left}";:zc=3-zc:zt=ti+15
60030 goto60010
// Build the player input line (in$) as characters (z$) are entered.
60070 z=asc(z$):zl=len(in$):if (z and 127)<32 then print" {left}";:goto 60110
60090 if zl>254 then 60010
60100 in$=in$+z$:printz$;zd$;z$;
// If RETURN key was pressed, return $in to caller.
// cr$ was never defined in the program – it’s an empty variable here.
60110 if z=13 then in$=mid$(in$,2):print cr$;:return
60120 if z=20 and zl>1 then in$=left$(in$,zl-1):print"{left}";:goto 60010
// When SHIFT+RETURN (PETSCII 141) is pressed, delete an entire line of
// input text, if the length of the input line is greater than 1.
// chr$(-20*(zl>1)) will be 20 if in$ length (zl) is greater than 1.
// Otherwise it will be 0, and z$ will be chr$(0).
// (2 > 1) returns -1 in PET BASIC.
60130 if z=141 then z$=chr$(-20*(zl>1)):for z=2 to zl:print z$;:next z:goto 60000
60140 goto60010
```
---
<blockquote>

### Gosub 60500

This just prints a straight line across the screen as a separator,\
like an \<hr\> in HTML.

Only used once, for the title screen, so this is Brian Sawyer’s code.
</blockquote>

```
60500 for i=1 to 13:print"{SHIFT-*}{SHIFT-*}{SHIFT-*}";:next i:print"{left}{inst}{SHIFT-*}":return
```
---
<blockquote>

### Title Screen.

Display program name and copyright, then wait for keypress to start.

This was probably written by Brian Sawyer, as this same introduction screen\
is used in one of his games called 'Dungeon'.

The author name here is wrong. It’s a mistake made by someone at Code Works.

It should be M.J. Winter, not M.J. Lansing.\
The cover sheet that came with the cassette says 'Mary Jean Winter' is the author.
</blockquote>

```
// Sets uppercase/graphics mode on the PET. Could also be set to 14 to
// use the lower/upper case mixed mode without the extra graphics.
62000 poke 59468,12
// This line mistakenly had 'm.j. lansing' in the 1981 source code.
62005 print"{clr}{down}{down}";tab(15-len(pg$));pg$;" by m.j. winter"
62010 print"{down} cursor #";nm$;" copyright (c) 1981{down}
// Print horizontal line.
62020 gosub 60500
62030 print"{down}explore the miser's house (needs 16k)
62080 print"{down}{down}{down}press {rvon}return{rvof} to begin"
// Busy Wait for keypress
62090 get n$:if in$="" then 62090
62100 print"{down}{down}{down}one moment please...":goto 20