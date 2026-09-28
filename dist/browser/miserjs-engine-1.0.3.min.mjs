/**
 * I have intentionally used the most primitive types and functions in order to  
 * closely match the original Commodore PET source code.
 * 
 * There are lots of opportunities for modernizing or optimizing the code in  
 * many different languages, including JavaScript here.
 * 
 * I thought it best to keep it simple so this code could be ported to  
 * non-object-oriented languages such as C, possibly on something as small as an  
 * Arduino. It also makes it easier for someone new to programming to add new  
 * rooms, floors, or objects.
 *  
 */
export default class MiserJSEngine{
/**
   * This is where the response text is built, line by line, possibly from multiple methods.  
   * Usually there is some text followed by output from the LOOK command.
   * @type {string}
   */
#t="";
/**
   * @type {MiserState}
   */
#e;
/**
   * Verb.
   * @type {string|null} First word in input: the verb.
   */
#s=null;
/**
   * Object.
   * @type {string|null} Second word in input: the object. Can be used later, as with the SAY verb.
   */
#r=null;
/**
   * If the input is greater than #INPUT_STRING_LIMIT characters, trim it.  
   * Change this if you add new commands or object names that would exceed this length.
   * @type {number} To limit how much of the input string is subject to the tokenizer. */
static#i=40;
/**
   * 
   * @param {MiserState|null} miserState 
   */
constructor(t=null){
// ToDo: Check for a valid MiserState object.
this.#e=t||JSON.parse(JSON.stringify(MiserJSEngine.#n))}newGame(){
// Deep copy the default state.
this.#e=JSON.parse(JSON.stringify(MiserJSEngine.#n))}
/**
   * The primary method for playing the game.  
   * @param {string} input Player input text.
   * @returns {MiserResponse}
   */request(t){this.#t="";
/**
     * Simple argument checking here, since you will be using
     * this engine behind your own front-end anyway.
     * Do more strict player input sanitization there.
     * You'll probably want to parse the player input in your front-end and
     * add some special commands like 'save', 'load', etc.
     */
let e=t;if(!e)return this.#o("No input was provided.",!1,!0);
// Make sure leading and trailing white-space is deleted.
e=e.trim(),
/**
     * If the inputString is greater than #INPUT_STRING_LIMIT characters,  
     * trim it, to minimize the work done in the tokenizer below.  
     * Change this (above) if you add new commands or object names that would exceed this length.  
     * Default value: 40 characters for a "verb object" input line.  
     */
e.length>MiserJSEngine.#i&&(e=e.substring(0,MiserJSEngine.#i))
/**
     * Simple tokenizer to get the words. 
     */;let s,r,i=0,n=0,o=[];
// The following will remove leading spaces, spaces between words, and trailing spaces.
do{" "!==e.charAt(i)?i++:(i>n&&o.push(e.substring(n,i)),i++,n=i)}while(i<e.length);
// Get the final word, which might be the entire string if there were no spaces in it.
// JavaScript substring does not include the character at the end index (stringIndex here).
switch(i>n&&o.push(e.substring(n,i)),o.length){case 1:
// Search the verbs list 
return s=this.#a(o[0]),s>0?(this.#s=o[0],this.#h(s,0)):this.#u();case 2:return s=this.#a(o[0]),s>0?(this.#s=o[0],r=this.#p(o[1]),r>0?(this.#r=o[1],this.#h(s,r)):this.#u()):this.#u();default:return this.#o("Please type a one or two word command.\n")}}
/**
   * Implements the BASIC code at lines 900-920.  
   * @param {number} i
   * @param {number} j
   */#h(t,e){switch(t){case 1:case 2:return this.#l(e);case 3:case 4:case 5:return this.#c(e);case 6:return this.#m(e);case 7:return this.#S(e);case 8:case 29:return this.#d();case 9:return this.#g();case 10:return this.#f(e);case 11:return this.#T(e);case 12:return this.#y(e);case 13:return this.#w(e);case 14:return this.#b(e);case 15:return this.#x();case 16:return this.#k(e);case 17:case 18:return this.#v();case 19:case 20:return this.#I();case 21:case 22:return this.#E();case 23:case 24:return this.#P();case 25:return this.#M();case 26:return this.#Y(e);case 27:return this.#R();case 28:return this.#J();
// Case 29, INVENTORY, handled above at case 8,29. 
case 30:return this.#O(e);default:throw new Error(`In Action method: Verb '${this.#s}' was defined in the verbs array, but not implemented yet.`)}}
/**
   * Case 1 and 2: Get, Take
   * @param {number} j Index into objects array.
   * @returns {MiserResponse}
   */#l(t){if(0==t)return this.#u();if(-1==this.#e.pt[t])return this.#o("I am unable to do that.\n");if(-1==this.#G(t))return this.#o("You're already carrying it.\n");if(this.#G(t)!=this.#e.cp)return this.#N();this.#e.ol[this.#e.pt[t]]=-1,this.#t+="Ok\n";
// Line 1030
let e=this.#e.pt[t];return e>3&&e<9||19===e?(this.#e.gt+=1,this.#t+="You got a treasure!\n",this.#o(this.#t)):(2===t&&-2===this.#e.ol[20]&&(
// Sets key location to Front Porch.
this.#e.ol[20]=0,this.#t+="You find a door key!\n"),this.#o(this.#t))}
/**
   * Case 3,4,5: Move, Slide, Push
   * This method implements the functionality of lines 2000-2210 in the original Miser program.
   * @param {number} j Index into objects array.
   * @returns {MiserResponse}
   */#c(t){if(0==t)
// Prints the "What?" or "I don't understand that." messages.
// Lines 210 and 50000 in the original 1981 Miser program.
return this.#u();
// Check the pt[] array for a -1, which means this object doesn't move.
// Skip the check for the cabinet pt[13], since it can be moved conditionally. Checked after this in the switch.
if(13!=t){if(-1==this.#e.pt[t])return this.#o("That item stays put.\n");if(this.#e.ol[this.#e.pt[t]]!=this.#e.cp&&-1!=this.#e.ol[this.#e.pt[t]])
// "I don't see it here."
return this.#N()}
// Only the CABINET, MAT, and RUG can move.
switch(t){
// Mat
case 2:
// If brass door key not found/hidden (-2).
if(-2==this.#e.ol[20])
// Set object location (ol[20]) of key (20) to the front porch (rString[0]).
return this.#e.ol[20]=0,this.#o("You find a door key!\n");break;
// Oriental Rug
case 10:
// If trapdoor not found/hidden (-2)
if(-2==this.#e.ol[16])
// Found trapdoor. Location is now in the Formal Parlor, so it will be observed on a new LOOK command.
return this.#t+="You find a trap door!\n",this.#e.ol[16]=6,this.#x();break;
// Cabinet
case 13:
// CP=5=Red-Walled Room rString[5]
// rPercent(5,3)=0 means EAST direction is unavailable, meaning the vault has not been found yet.
// So this means, 'If in Red-Walled Room and EAST direction unavailable, move the cabinet and find the vault'.
return 5==this.#e.cp&&0==this.#e.rPercent[5][3]?(
// fv is Found Vault: Set it to true.
this.#e.fv=!0,this.#t+="Behind the cabinet is a vault!\n",this.#x()):this.#o("That item stays put.\n")}return this.#o("Moving it reveals nothing.\n")}
/**
   * CASE 6: Open.\
   * Lines 4000-4260 in the original Miser program from 1981.  
   * The only objects that have a response for open are:  
   * Valve (7), Book (11), Door (12), Cabinet (13),  
   * Organ (16), Bag (22), and Vault (27).
   * @param {number} j Index into objects array.
   * @returns {MiserResponse}
   */#m(t){switch(t){case 0:
// Nothing to open.
return this.#u();case 7:
// Valve.
return this.#o("Try turning it.\n");case 11:
// Book.
if(this.#e.ol[this.#e.pt[t]]==this.#e.cp||-1==this.#e.ol[this.#e.pt[t]])return this.#o("Scrawled in blood on the inside front cover is the message, \"'Victory' is a prize-winning word\".\n");break;case 12:
// Door.
switch(this.#e.cp){case 0:
// Front Porch.
// Door unlocked?
return this.#e.du?this.#o("It's already open.\n"):this.#o("Sorry, the door is locked.\n");case 6:
// Formal Parlor.
return this.#t+="You open the door. You lean over to peer in, and you fall in!\n",this.#e.cp=47,this.#x()}return this.#N();
// Cabinet
case 13:
// In Red-Walled room? (CP=5)
return this.#e.ol[26]==this.#e.cp?this.#o("The cabinet is empty and dusty.\nScribbled in dust on one shelf are the words, 'behind me'.\n"):this.#N();
// Organ
case 16:
// In Ballroom?
return 21==this.#e.cp?this.#e.gg?-2!=this.#e.ol[24]?(
// Hide the 'ORGAN IN THE CORNER' and reveal the 'OPEN ORGAN IN THE CORNER'
this.#e.ol[24]=-2,this.#e.ol[25]=21,
// Reveal the Parachute Ripcord
this.#e.ol[17]=21,
// Reveal the Ruby Slippers
this.#e.ol[19]=21,this.#t+="As you open it, several objects suddenly appear!\n",this.#x()):this.#o("It's already open.\n"):this.#o("It's stuck shut.\n"):this.#N();
// Bag
case 22:
// If in the vault or carrying it 
return this.#e.ol[this.#e.pt[t]]==this.#e.cp||-1==this.#e.ol[this.#e.pt[t]]?this.#o("The bag is knotted securely.\nIt won't open.\n"):this.#N();
// Vault
case 27:
// If in Red-Walled Room and FV=true (found vault)
return 5==this.#e.cp&&this.#e.fv?
// Vault open?
this.#e.vo?this.#o("It's already open.\n"):this.#o("I can't, it's locked.\n"):this.#N()}return this.#o("I don't know how to open that.\n")}
/**
   * CASE 7: Read.  
   * Lines 5000-5050 in the original Miser program from 1981.
   * @param {*} j Index into objects array. 
   * @returns 
   */#S(t){
// Second word to act on?
if(0==t)
// Returns 'What?' or 'I don't understand that.'. 
return this.#u();if(-1==this.#e.pt[t])return this.#o("There's nothing written on that.\n");if(!this.#j(t))
// Returns "I don't see it here."
return this.#N();switch(t){
// PAPER
case 3:
// Player now knows the combination to the vault
return this.#e.kc=!0,this.#o("It says, '12-35-6'.\nhmm.. looks like a combination.\n");
// BOOK
case 11:return this.#o("The front cover is inscribed in Greek.\n");default:return this.#o("There's nothing written on that.\n")}}
/**
   * Case 8,29: Inventory.  
   * Output a list of all objects the player is carrying.  
   * Lines 6000-6040 in the original Miser program from 1981.
   * @returns {MiserResponse}
   */#d(){this.#t+="You are carrying the following:\n\n";let t=0;for(let e=1;e<28;e++)
// Carrying object omString[x]?  
if(-1==this.#e.ol[e]){
// Bucket full?
if(t=1,this.#t+=`${MiserJSEngine.#D[e]}\n`,1==e&&this.#e.bf){this.#t+="  The bucket is full of water.\n";continue}14==e&&(this.#t+="  (Better fix it)\n")}
// Found items?
return 1==t?this.#o(this.#t):this.#o(this.#t+="Nothing at all.\n")}
/**
   * Case 9: Quit.  
   * Lines 7000-7150 in the original Miser program from 1981.  
   *   
   * Special actions for quit should be for the host program to decide.  
   * The host could use the method, this.#showFinalOutcome or combine it with a  
   * score display, or something else.
   * @returns {MiserResponse}
   */#g(){
// Take special action for quit in the host program.
// The host could use the method, this.showFinalOutcome, or combine it with a score display, or something else.
return this.#o(this.#t,MiserJSEngine.#A.QUIT)}
/**
   * Case 10: Drop.  
   * Lines 8000-8221 in the original Miser program from 1981.
   * @param {number} j Index into objects array.
   * @returns {MiserResponse}
   */#f(t){
// Preservation of bug in original code
if(-1==this.#e.pt[t])return this.#t+="\n?ILLEGAL QUANTITY ERROR IN  8000\n\n",this.#t+="----------------------------------------",this.#t+="** You have encountered a bug that\n",this.#t+="existed in the original Miser program\n",this.#t+="from 1981. **\n\n",this.#t+="This bug is being reproduced here to\n",this.#t+="preserve the experience a player would\n",this.#t+="have had playing this game in 1981 on\n",this.#t+="one of the Commodore PET computers.\n\n",this.#t+="Except for one thing...the game doesn't\n",this.#t+="just end unexpectedly here as it did\n",this.#t+="back then.\n\n",this.#t+="You get to keep playing as if nothing\n",this.#t+="bad happened!\n",this.#o(this.#t);
// Carrying this object?
if(-1!=this.#e.ol[this.#e.pt[t]])return this.#o("You aren't carrying it!\n");
// Ok, player is carrying the object represented by pt[j], since ol[pt[j]] has a value of -1 here.
// The only objects that DROP should provide a special response for are the 5 treasures, the Penny, and the Cross.
// All other objects just get dropped with an 'Ok' response.
// Check for one of the 5 treasures
switch(this.#e.pt[t]){
// One of the 5 treasures
// Remember that the value of pt[j] is an index into the omString array (om$() in original program).
case 4:case 5:case 7:case 8:case 19:return this.#o("Don't drop *treasures*!\n")}
// Check for a Penny or a Cross specifically. All other objects should just be dropped with a response of "Ok"
switch(t){
// Drop Penny
case 19:
// In Portico?
if(19==this.#e.cp)
// The Penny is being carried, and the player is in the Portico.
// DROP PENNY action
// Update the EAST (3) direction of the BALLROOM (21) to point toward the CHAPEL (22)
// Player can now move from the BALLROOM to the CHAPEL. 
// Modifies rPercent array.
return this.#e.rPercent[21][3]=22,
// Update object location of the PENNY to 'hidden'(-2)
this.#e.ol[12]=-2,this.#o("As the penny sinks below the surface of the pool, a fleeting image of a chapel with dancers outside appears.\n");break;
// Drop Cross.
case 20:
// In Chapel?
if(22==this.#e.cp)
// "chapel. A tablet says 'drop a religious item or die!!' becomes simply "chapel".
// rString array was directly modified here in the original source code.
// This is now handled as a special case in the LOOK command, when in the chapel (index 22 in rString).
// That way we can keep the rString array as static data that never changes, doesn't have to be saved/restored.
// DON'T USE NOW: this.#miserState.rString[22] = "chapel";
// "organ in the corner" becomes "closed organ playing music in the corner"
// omString array was directly modified here in the original source code.
// This is now handled as a special case in the LOOK command, when in the ballroom.
// That way we can keep the omString array as static data that never changes, doesn't have to be saved/restored.
// DON'T USE NOW: this.#miserState.omString[24] = "closed organ playing music in the corner";
// The CROSS is being carried, and the player is in the Chapel.
// DROP CROSS action
// LINES 8200-8221 in the original program.
// Still trying to figure out what GG could stand for.
// If GG is TRUE it means the player can OPEN the ORGAN in the BALLROOM.
// Prior to dropping the CROSS here, this wasn't possible.
// GG = 'Got God'? You know...chapel...cross...God...
return this.#e.gg=!0,
// RUSTY CROSS becomes 'hidden' (-2) 
this.#e.ol[11]=-2,this.#o("Even before it hits the ground, the cross fades away!\n\nThe tablet has disintegrated.\n\nYou hear music from the organ.\n")}
// If the PENNY or the CROSS weren't in their special action locations in the above switch statement, they will be dropped here.
// Any other objects being carried will be dropped here as well.
// ol[pt[j]] (object location) gets updated to the current position. (CP) 
return this.#e.ol[this.#e.pt[t]]=this.#e.cp,this.#o("Ok\n")}
/**
   * Case 11: Say.  
   * Lines 9000-9300 in the original Miser program from 1981.
   * @param {number} j Index into objects array.
   * @returns {MiserResponse}
   */#T(t){switch(t){
// No second word to say
case 0:return this.#o("Say what???\n");
// Lines 9100-9120 Say ritnew
case 14:
// In Pantry?
return 4==this.#e.cp?
// Charmed Snake?
this.#e.ch?this.#o("Nothing happens.\n"):(this.#e.ch=!0,
// Vicious snake disappears from conservatory.
this.#e.ol[2]=-2,
// Charmed Snake appears in conservatory. (rString[4])
this.#e.ol[3]=4,this.#o("The snake is charmed by the very utterance of your words.\n")):this.#o("Nothing happens.\n");
// Lines 9200-9220 Say victory
case 15:
// In Trophy room?
return 8==this.#e.cp?
// Portal open?
this.#e.po?this.#o("Nothing happens.\n"):(
// Set Portal Open
this.#e.po=!0,
// Set Trophy Room north direction to point toward rString[17], which is the Game Room.
// Modifies rPercent array.
this.#e.rPercent[8][1]=17,
// 'Portal in the North Wall' appears in the Trophy Room (rString[8]).
this.#e.ol[18]=8,this.#o("A portal has opened in the north wall!!\n")):this.#o("Nothing happens.\n");
// Line 9300 Say Xyzzy, Say Plugh (These are magic words used in the 'Colossal Cave Adventure' game from 1975!)
case 29:case 30:return this.#o("A hollow voice says, 'Wrong adventure'.\n");default:return t<29?this.#o(`Okay, '${this.#r}'.\nNothing happens.\n`):this.#u()}}
/**
   * CASE 12: Pour.  
   * Lines 10000 to 10060 in the original Miser program from 1981.  
   * @param {number} j Index into objects array.
   * @returns {MiserResponse}
   */#y(t){
// Only the bucket (oString[4]) can be poured.
if(4!=t)return this.#o("I wouldn't know how.\n");if(!this.#j(t))return this.#N();
// Is bucket empty?
if(!this.#e.bf)return this.#o("The bucket is already empty.\n");switch(this.#e.cp){
// BLUE DRAWING ROOM
case 10:
// Is fire burning?
if(this.#e.fb)
// Fire Burning becomes FALSE. The fire is out now.
return this.#e.fb=!1,
// Bucket is no longer full.
this.#e.bf=!1,this.#t+="Congratulations! You have vanquished the flames.\n",this.#x();break;
// PORTICO
case 19:return this.#o("Ok\n");

}return this.#o("The water disappears quickly.\n")}
/**
   * CASE 13: Fill.  
   * Lines 11000-11070 in the original Miser program from 1981.  
   * @param {number} j Index into objects array.
   * @returns {MiserResponse}
   */#w(t){if(0==t)
// "What?" or "I don't understand that."
return this.#u();if(-1==this.#e.pt[t])return this.#o("That wouldn't hold anything.\n");if(!this.#j(t))
// "I don't see it here."
return this.#N();
// Is this the bucket?
if(4==t){
// Is the bucket full?
if(this.#e.bf)return this.#o("It's already full.\n");switch(this.#e.cp){
// Bucket can ony be filled in the PORTICO and BACK YARD near the faucet.
case 19:case 23:return this.#e.bf=!0,this.#o("Your bucket is now full.\n");
// POOL AREA
case 25:if(this.#e.pf)return this.#o("I'd rather stay away from the mercury.\n")}return this.#o("I don't see any water here.\n")}
// Only the bucket can be filled
return this.#o("That wouldn't hold anything.\n")}
/**
   * Unlock.  
   * Only the DOOR, TRAPDOOR, and VAULT are acted on here.  
   * This method implements the functionality of lines 11000 to 11070  
   * in the original Miser program from 1981.
   * @param {number} j Index into objects array.
   * @returns {MiserResponse}
   */#b(t){
// Only the DOOR/TRAPDOOR (12) and the VAULT (27) can be unlocked
switch(t){
// No object
case 0:
// Return "What?" or "I don't understand that."
return this.#u();
// Door or Trapdoor
case 12:switch(this.#e.cp){
// Door at Front Porch (CP=0)
case 0:return this.#e.du?this.#o("It's already unlocked.\n"):
// Carrying the key? (omString[20])
-1!=this.#e.ol[20]?this.#o("I need a key.\n"):(this.#e.du=!0,this.#t+="The door easily unlocks and swings open.\n",this.#x());
// Trapdoor in Formal Parlor (CP=6) 
case 6:
// Trapdoor Hidden? 
return-2!=this.#e.ol[16]?this.#o("The trapdoor has no lock.\n"):this.#o("I don't see it here.\n");default:
// "I don't see it here."
return this.#N()}
// Vault
case 27:
// In Red-Walled Room?
return 5==this.#e.cp?
// Vault open?
this.#e.vo?this.#o("It's already open.\n"):
// Found vault?
this.#e.fv?
// Know combination?
this.#e.kc?(this.#e.vo=!0,
// Modifies rPercent array.
this.#e.rPercent[5][3]=46,this.#t+="Ok, let's see. 12..35..6..\n<CLICK!> The door swings open.",this.#x()):this.#o("I don't know the combination.\n"):this.#N():this.#N();default:return this.#o("I wouldn't know how to unlock one.\n")}}
/**
   * CASE 15: Look.  
   * Lines 14000-14170 in the original Miser program from 1981.  
   * @returns {MiserResponse}
   */#x(){
// Line 14000 - Print current position
let t=this.#e.cp;22==t&&this.#e.gg?
// If in chapel, and already dropped the cross, print a different room description.
this.#t+="\nYou are in the chapel.\n":this.#t+=`\nYou are in the ${MiserJSEngine.#B[t]}.\n`;
// Lines 14010-14030 Print list of all objects at this location (CP variable)
for(let e=1;e<29;e++)this.#e.ol[e]==t&&(
// Object found at this location (CP).
// Special case for the organ.
24==e&&this.#e.gg?this.#t+="\nThere is a closed organ playing music in the corner here.\n":this.#t+=`\nThere is a ${MiserJSEngine.#D[e]} here.\n`,
// If the plastic bucket is here and it is full (BF=true).
1==e&&this.#e.bf&&(this.#t+="  The bucket is full of water.\n"));
// Special actions depending on current position (CP)
switch(this.#e.cp){case 0:
// Line 14127 Front Porch
// Door unlocked?
this.#e.du&&(this.#t+="\nAn open door leads north.\n");break;case 5:
// Lines 14125-14126 Red-Walled Room
// Found vault?
this.#e.fv&&(this.#t+="\nThere is a vault in the east wall.\n"),this.#e.vo&&(this.#t+="The vault is open.\n");break;case 10:
// Lines 14060-14080 and 14120 Blue Drawing Room
this.#e.fb?
// Fire Burning
this.#t+="\nThere is a hot fire on the south wall!\nIf I go that way I'll burn to death!\n":this.#t+="\nThere is evidence of a recent fire here.\n";break;case 16:
// Lines 14090-14105 Pantry
this.#t+="\nA rich, full voice says, 'Ritnew is a charming word'.\n";break;case 23:
// Line 14115 Back Yard
this.#t+="\nThere is a leaky faucet nearby.\n";break;case 25:
// Lines 14040-14056 Pool Area
// Pool full?
this.#e.pf?this.#t+="\nThe pool is full of liquid mercury!\n":(this.#t+="\nThe pool's empty.\n",48==this.#e.ol[7]&&(this.#t+="\nI see something shiny in the pool!\n"));break;case 26:
// Line 14110 Pump House
this.#t+="\nThere is a valve on one of the pipes.\n";break;case 48:
// Line 14130 Bottom of Swimming Pool
// Skip showing obvious exits.
return this.#o(this.#t)}
// Lines 14130-14170
// Print all available direction commands from this location.
return this.#t+="\nObvious Exits:\n",this.#e.rPercent[this.#e.cp][1]>0&&(this.#t+="N "),this.#e.rPercent[this.#e.cp][2]>0&&(this.#t+="S "),this.#e.rPercent[this.#e.cp][3]>0&&(this.#t+="E "),this.#e.rPercent[this.#e.cp][4]>0&&(this.#t+="W "),
// Add newline.
this.#t+="\n",this.#o(this.#t)}
/**
   * CASE 16: Go.  
   * Lines 15000-15080 in the original Miser program from 1981.  
   * @param {number} j Index into objects array.
   * @returns {MiserResponse}
   */#k(t){
// Valid objects are Ladder(8), Stairs(18), and Pool(28).
switch(t){
// Ladder
case 8:
// In bottom of pool?
return 48==this.#e.cp?(
// Move from 'bottom of swimming pool' to 'Pool Area'
this.#e.cp=25,this.#x()):this.#N();
// Stairs
case 18:
// In 'Great Hall' or 'Middle of the western hallway'?
switch(this.#e.cp){
// Great Hall.
case 2:
// Carrying sword?
return-1==this.#e.ol[9]?(
// Move from Great Hall to 'Middle of the western hallway'
this.#e.cp=27,this.#t+="The suits of armor try to stop you, but you fight them off with your sword.\n",this.#x()):this.#o("The suits of armor prevent you from going up!\n");
// Middle of the western hallway.
case 27:
// Move to Great Hall
return this.#e.cp=2,this.#x();default:
// Print "I don't see it here."
return this.#N()}
// Pool
case 28:
// Pool full?
return this.#e.pf?this.#o("The pool is full of mercury!\n"):(
// Move to bottom of swimming pool
this.#e.cp=48,this.#x());default:return this.#u()}}
/**
   * CASE 17,18: North.  
   * Lines 16000-16020 in the original Miser program from 1981.  
   * @returns {MiserResponse}
   */#v(){return 0!=this.#e.cp||this.#e.du?0==this.#e.rPercent[this.#e.cp][1]?this.#C():(0==this.#e.cp&&(this.#t+="\nThe door slams shut behind you!\n"),this.#e.cp=this.#e.rPercent[this.#e.cp][1],this.#x()):(this.#t+="The door is locked shut.\n",this.#o(this.#t))}
/**
   * CASE 19,20: South.  
   * Lines 17000 to 17050 in the original Miser program from 1981.  
   * @returns {MiserResponse}
   */#I(){if(10==this.#e.cp&&this.#e.fb)return this.#t+="You have burnt to a crisp!\n",this.#o(this.#t,MiserJSEngine.#A.DIED);const t=this.#H();return null!=t?t:0==this.#e.rPercent[this.#e.cp][2]?this.#C():(this.#e.cp=this.#e.rPercent[this.#e.cp][2],this.#x())}
/**
  * CASE 21,22: East.  
  * There is a check for the snake every time the player tries to move East,  
  * regardless of the current position. 
  * Lines 17010 to 17050 in the original Miser program from 1981.  
  * @returns {MiserResponse}
  */#E(){const t=this.#H();return null!=t?t:0==this.#e.rPercent[this.#e.cp][3]?this.#C():(this.#e.cp=this.#e.rPercent[this.#e.cp][3],this.#x())}
/**
  * CASE 23,24: West.  
  * Lines 19000 to 19010 in the original Miser program from 1981.  
  * @returns {MiserResponse}
  */#P(){return 0==this.#e.rPercent[this.#e.cp][4]?this.#C():(this.#e.cp=this.#e.rPercent[this.#e.cp][4],this.#x())}
/**
  * CASE 25: Score.  
  * Lines 20000 to 20060 in the original Miser program from 1981.  
  * @returns {MiserResponse}
  */#M(){this.#t+=`Your current score is: ${20*this.#e.gt} points.\n(100 possible)\n`;let t=this.#e.gt;this.#e.es&&t++,this.#t+=`\nYour rank is: ${MiserJSEngine.#$[t]}\n`;let e=MiserJSEngine.#$.length-1-t;return this.#t+=0==e?"  (You have escaped with ALL available treasure!)\n":1==e?"  (There is only one rank left for you to achieve!)\n":`  (There are ${e} more ranks you can achieve.)\n`,this.#o(this.#t)}
/**
  * CASE 26: Turn.  
  * Only the VALVE can be turned.  
  * Lines 21000 to 21070 in the original Miser program from 1981.  
  * @param {number} j Index into objects array.
  * @returns {MiserResponse}
  */#Y(t){return 7!=t?this.#o("I don't know how to turn such a thing.\n"):26!=this.#e.cp?this.#N():(
// Toggle POOL FULL
this.#e.pf=!this.#e.pf,this.#o("With much effort, you turn the valve 5 times. You hear the sound of liquid\nflowing through the pipes.\n"))}
/**
  * CASE 27: Jump.  
  * Can only JUMP from MIDDLE OF THE WESTERN HALLWAY, FRONT BALCONY, and REAR BALCONY.  
  * Lines 22000 to 22540 in the original Miser program from 1981.  
  * @returns {MiserResponse}
  */#R(){switch(this.#e.cp){case 27:
// MIDDLE OF THE WESTERN HALLWAY
return this.#t+="You jump...\n",this.#e.jm?(this.#t+="Now you've done it. You ignored\nmy warning, and as a result\nyou have broken your neck!\n\nYou are dead.",this.#o(this.#t,MiserJSEngine.#A.DIED)):(this.#e.jm=!0,this.#e.cp=2,this.#t+="You have landed down-stairs,\nand narrowly escaped serious\ninjury. Please don't try it again.\n",this.#x());case 29:case 32:
// Next action depends on the three possible states of the parachute in the players inventory:
//      1) No parachute. Not in inventory.
//      2) Carrying the parachute that hasn't been fixed with the ripcord.
//      3) Carrying a fully functional parachute.
if(this.#t+="You jump...\n",-1==this.#e.ol[14])
// Have Parachute with no ripcord.
return this.#t+="There is no way to open the parachute!\n",this.#t+="You hit the ground.\n",this.#t+="You have broken your neck!\n\n",this.#t+="You are dead.",this.#o(this.#t,MiserJSEngine.#A.DIED);if(-1!=this.#e.ol[27])return this.#t+="You hit the ground.\n",this.#t+="You have broken your neck!\n\n",this.#t+="You are dead.",this.#o(this.#t,MiserJSEngine.#A.DIED);if(
// Have fully functional parachute.
this.#t+="You yank the ripcord and the\n'chute comes billowing out.\n",32==this.#e.cp)
// At rear balcony, so change current position to HEDGE MAZE (40)
return this.#e.cp=40,this.#x();if(29==this.#e.cp)return this.#t+="You land safely.\n\nCongratulations on escaping!\n",this.#e.es=!0,this.#o(this.#t,MiserJSEngine.#A.ESCAPED);default:return this.#t+="There's nowhere to jump.",this.#o(this.#t)}}
/**
  * CASE 28: Swim.  
  * Lines 24000 to 24030 in the original Miser program from 1981.  
  * @returns {MiserResponse}
  */#J(){switch(this.#e.cp){case 19:
// Portico.
return this.#o("The water is only a few inches deep.\n");case 25:
// Pool area.
// Pool full?
return this.#e.pf?this.#o("In mercury? No way!\n"):this.#o("The pool is empty.\n");default:return this.#o("There's nothing here to swim in!\n")}}
// Case 29: INVENTORY -> Handled at Case 8 above (Case 8,29:)
/**
  * CASE 30: Fix.  
  * Lines 25000 to 25070 in the original Miser program from 1981.  
  * @param {number} j Index into objects array.
  * @returns {MiserResponse}
  */
#O(t){switch(t){case 0:
// Nothing to fix
return this.#u();case 7:
// Valve
return this.#o("I ain't no plumber.\n");case 17:
// If parachute with no ripcord isn't at current position AND not carrying it
return this.#j(t)?-2==this.#e.ol[14]?this.#o("It's already fixed.\n"):
// If not carrying the ripcord
-1!=this.#e.ol[17]?this.#o("I need a ripcord.\n"):(
// Have parachute with no ripcord, and ripcord is here, so fix the parachute.
// Reveal 'repaired parachute' at the same location as 'parachute with no ripcord'
this.#e.ol[27]=this.#e.ol[14],
// Hide 'parachute with no ripcord'
this.#e.ol[14]=-2,
// Update pointer to omString[27] 'repaired parachute'
this.#e.pt[17]=27,
// Update parachute ripcord location to the front porch. Weird, but it works to hide it.
this.#e.ol[17]=0,this.#o("I'm no expert, but I think it'll work.\n")):this.#N();default:return this.#o("I wouldn't know how.\n")}}
/**
   * 
   * @returns {MiserResponse|null}
   */#H(){return 4!=this.#e.cp||this.#e.ch?null:this.#e.ps?this.#o("The snake bites you!\nYou are dead.\n",MiserJSEngine.#A.DIED):(this.#e.ps=!0,this.#o("The snake is about to attack!\n"))}
/**
   * Call this method after player dies or escapes, to get the final score and rank.
   * @returns {MiserResponse}
   */showFinalOutcome(){this.#t=`\nYou accumulated ${this.#e.gt} treasures, \n for a score of ${20*this.#e.gt} points.\n(100 Possible)\n`;let t=this.#e.gt;return this.#e.es?t++:this.#t+="\nHowever, you did not escape.\n",this.#t+=`\nThis puts you in a class of:\n${MiserJSEngine.#$[t]}\n`,6!=t&&(this.#t+="\nBetter luck next time!\n"),this.#o(this.#t,!0)}
/**
   * Creates new output arguments.
   * @param {string} outputText String to return.
   * @param {boolean|string} [gameOver=false]
   * @param {boolean} [isError=false] Signal an error to the host program.
   * @returns {MiserResponse}
   */#o(t,e=!1,s=!1){return{text:t,gameOver:e,isError:s}}
/**
   * Line 810 in original program from 1981.
   * @param {string} s 
   * @returns {number} Index into verbs[] array, or 0 if not found.
   */#a(t){(t=t.toLowerCase()).length>4&&(t=t.substring(0,4))
/*
    This can be done more efficiently in most languages, but this is how
    it's done in the original 1981 program at Line 810.
    */;for(let e=1;e<MiserJSEngine.#z.length;e++)if(t===MiserJSEngine.#z[e])
// Match. Return array index into the verbs array.
return e;return 0}
/**
   * @param {string} s 
   * @returns {number} Index into objects[] array, or 0 if not found.
   */#p(t){(t=t.toLowerCase()).length>4&&(t=t.substring(0,4));for(let e=1;e<MiserJSEngine.#F.length;e++)if(t===MiserJSEngine.#F[e])
// Match. Return array index into the objects array.
return e;return 0}
/**
   * Returns one of "What?" or "I don't understand that."
   * @returns {MiserResponse}
   */#u(){return this.#t+=`${MiserJSEngine.#L[this.#e.em]}\n`,
// Alternate between hString[1] and hString[2].
this.#e.em=3-this.#e.em,this.#o(this.#t)}
/**
   * Returns "I don't see it here."
   * @returns {MiserResponse}
   */#N(){return this.#t+="I don't see it here.\n",this.#o(this.#t)}
/**
   * Line 52000 in the original 1981 program.  
   * Tried to go in a direction not defined in r%(room number, N, S, E, W)  
   * Returns "It's impossible to go that way."
   * @returns {MiserResponse} 
   */#C(){return this.#t+="It's impossible to go that way.\n",this.#o(this.#t)}
/**
   * If object is at current position (cp) or being carried (-1), it is present.  
   * In the 1981 source code, this check is done at multiple locations, using  
   * the same line of code:  
   * Lines 2020, 4005, 4170, 5005, 11020, 25030
   * @param {number} j 
   * @returns {boolean}
   */#j(t){return this.#G(t)==this.#e.cp||-1==this.#G(t)}
/**
   * Returns an object location value for the object typed after the verb on an input line.
   * @param {number} x Index into objects array.
   */#G(t){return this.#e.ol[this.#e.pt[t]]}getCurrentPosition(){return this.#e.cp}
/**
   * Get a more concise name for the current room/location listed in the rString[] array.
   * @param {number} cp Current position from a MiserState object.
   * @returns {string}
   */getCurrentPositionShortName(t){return MiserJSEngine.#W[t]}
/**
   * 
   * @param {MiserState} miserState 
   */getInventoryItemCount(t){let e=0;for(const s of t.ol)-1==s&&e++;return e}
/**
   * Return current game state, so you can save it somewhere.
   * @returns {MiserState}
   */getGameState(){return this.#e}
/**
   * Set new game state.  
   * Call this after you restore a previously saved game.
   * @param {MiserState} miserState
   */setGameState(t){this.#e=t}isGameInProgress(){return this.#e.cp>0}
/* #####  Start of STATIC DATA  ###### */
/* This data is not modified in the original source code. */
/**
   * List of actions, such as LOOK, GET, MOVE, etc.  
   * v$ (verbs) begins at 1 in the original program.  
   * Setting index 0 to "" here.  
   * Defined at Line 500 in the original program from 1981.  
   * STATIC DATA: This array was not modified in the original source code.
   * @type {string[]}
   */static#z=["","get","take","move","slid","push","open","read","inve","quit","drop","say","pour","fill","unlo","look","go","nort","n","sout","s","east","e","west","w","scor","turn","jump","swim","i","fix"];
/**
   * List of objects.
   * o$ (objects) begins at 1 in the original program. Setting index 0 to "" here.
   * 
   * STATIC DATA: This array was not modified in the original source code.
   * @type {string[]}
   */
static#F=["","ripc","mat","pape","buck","swor","key","valv","ladd","slip","rug","book","door","cabi","ritn","vict","orga","para","stai","penn","cros","leaf","bag",">$<",">$<","ring","pain","vaul","pool","xyzz","plug"];
/**
   * Error messages.  
   * Alternates between index 1 and 2 via the em variable.  
   * em starts at 1 in the program.  
   * em=3-em changes that to em=2 and  
   * the next em=3-em changes that em=2 to em=1.  
   * STATIC DATA: This array was not modified in the original source code.
   * @type {string[]}
   */
static#L=["","What?","I don't understand that."];
/**
   * Rank descriptions.  
   * STATIC DATA.
   * @type {string[]}
   */
static#$=["<Beginner Adventurer>","<Amateur Adventurer>","<Journeyman Adventurer>","<Experienced Adventurer>","<Pro Adventurer>","<Master Adventurer>","<Grandmaster Adventurer>"];static#D=["",// om$ begins at 1 in the original program. Setting index 0 to "" here.
"plastic bucket","vicious snake","charmed snake","*golden leaf*","*bulging moneybag*",">$<","*diamond ring*","*rare painting*","sword","mat","rusty cross","penny","piece of paper","parachute with no ripcord","oriental rug","trapdoor marked 'danger'","parachute ripcord","portal in the north wall","pair of *ruby slippers*","brass door key","majestic staircase leading up","majestic staircase leading down","battered book","organ in the corner","open organ in the corner","cabinet on rollers against one wall over","repaired parachute","sign saying 'drop coins for luck'"];static#B=["front porch","Foyer to a large house. Dust is everywhere","Great Hall. Suits of armor line the walls","Breakfast Room. It is bright and cheery","Conservatory. Through a window you see a hedge-maze","Red-Walled Room","Formal Parlor","Green Drawing Room","Trophy Room. Animal heads line the walls","Den","Blue Drawing Room","Library. Empty shelves line the walls","Dining Room","Chinese Room","$","Kitchen. It is bare","Pantry. Dust covers the mahogany shelves","Game Room","Smoking Room. The air is stale in here","Portico. A murky pool glimmers on the south side","Hall Of Mirrors - a good place to reflect","Ballroom. It has a beautiful wood dance floor","Chapel. A tablet says 'Drop a religious item or die!!'","back yard","forest","Pool Area. There is a large swimming pool here","Pump House. There is pool machinery installed here","middle of the Western Hallway","West Bedroom","Front Balcony. There is a large road below","$","Master Bedroom. There's a huge four-poster bed","Rear Balcony. Below you see a Hedge Maze","East Bedroom","Closet","Junction of the West Hallway and the North-South Hallway","Center of the North-South Hallway","Junction of the East Hallway and the North-South Hallway","Middle of the East Hallway","South end of the East Hallway","hedge maze","hedge maze","hedge maze","hedge maze","hedge maze","hedge maze","walk-in Vault","Dungeon. There is light above and to the south","bottom of the Swimming Pool. A ladder leads up and out"];static#W=["Front Porch","Foyer","Great Hall","Breakfast Room","Conservatory","Red-Walled Room","Formal Parlor","Green Drawing Room","Trophy Room","Den","Blue Drawing Room","Library","Dining Room","Chinese Room","$","Kitchen","Pantry","Game Room","Smoking Room","Portico","Hall of Mirrors","Ballroom","Chapel","Back Yard","Forest","Pool Area","Pump House","Middle of West Hallway","West Bedroom","Front Balcony","$","Master Bedroom","Rear Balcony","East Bedroom","Closet","West Hallway Junction","Center of North-South Hallway","East Hallway Junction","Middle of East Hallway","South End East Hallway","hedge maze","hedge maze","hedge maze","hedge maze","hedge maze","hedge maze","Vault","Dungeon","Swimming Pool"];static#A=Object.freeze({DIED:"died",ESCAPED:"escaped",QUIT:"quit"});
/* #####  End of STATIC DATA  ###### */
/* ###### Variable Game State Data ###### */
/* Gets deep copied into a new MiserState object for a new game. */
/** 
   * @type {MiserState}
   */
static#n={cp:0,em:1,gt:0,du:!1,pf:!0,fb:!0,bf:!1,fv:!1,vo:!1,po:!1,ch:!1,ps:!1,kc:!1,es:!1,jm:!1,gg:!1,
/**
     * Object Pointer array.  
     * pt starts at index 1 in the original program. I'm keeping that here and just setting index 0 to 0.  
     * The index numbers align with the o$ objects array: o$(1)=ripcord, so pt%(1)'s value is an index pointer for the ripcord, into ol% and om$.  
     * A (-1) stored here means the object doesn't have an action for it, such as move, open, etc.  
     * The original 1981 program will crash when looking up ol%(pt%(object_index)) when pt%(object_index) returns -1.  
     * In that case, ol%(-1) produces an ILLEGAL QUANTITY error and the program ends.  
     * Many routines will check that pt%(object_index) isn't equal to a -1 before using it with ol% or om$, but some don't.  
     * For instance, if you try to DROP the CABINET, ORGAN, STAIRS, or any other object that has a -1 in pt%, the program crashes.  
     * (On crash, on the PET or in Vice/XPET on PC: type GOTO 14000 and you can resume the game. 14000=start of LOOK routine.)  
     * DYNAMIC DATA.
     * @type {number[]} 
     */
pt:[0,17,10,13,1,9,20,-1,-1,19,15,23,-1,-1,-1,-1,-1,14,-1,12,11,4,5,-1,-1,7,8,-1,-1,-1,-1],
/**
     * Object Location array.  
     * ol starts at index 1 in the original program. I'm keeping that here and just setting index 0 to 0.  
     * A (-1) stored here means the player is carrying the object. It will be listed by the I or INVEntory command.  
     * A (-2) stored here means the object is hidden.  
     * DYNAMIC DATA.
     * @type {number[]} 
     */
ol:[0,26,4,-2,45,46,-2,48,39,13,0,// Index 10 - Mat location, 0 = rString[0] = front porch
23,28,31,34,6,-2,-2,-2,-2,-2,// Index 20 - Brass Door Key, -2 = doesn't exist yet. Will change to 0 (front porch) when the mat is moved
2,27,11,21,-2,5,-2,19],
// This entire array is being saved in MiserState.
// Most of this array is static data, but 3 rooms are modified in the original source code.
// rPercent[5][3] gets modified. (Red-walled room. East becomes 46, to go into vault. )
// rPercent[8][1] gets modified. (Trophy room. North becomes 17, to go to Game Room. )
// rPercent[21][3] gets modified. (Ballroom. East becomes 22, to go to Chapel.)
// I thought someone might want to add additional floors, rooms, or portals that would require
// updating even more of these arrays, so I'm treating them all as dynamic/changing/must-save for now.
rPercent:[[0,1,0,0,0],[0,2,0,0,12],[0,3,1,0,0],[0,0,2,4,16],[0,0,5,7,3],[0,4,6,0,0],[0,5,0,10,0],[0,0,0,8,4],[0,0,9,0,7],[0,8,0,0,10],[0,0,11,9,6],[0,10,0,0,0],[0,0,0,1,13],[0,15,0,12,0],[0,0,0,0,0],[0,23,13,16,0],[0,0,0,3,15],[0,0,8,0,18],[0,21,0,17,19],[0,21,0,18,20],[0,21,21,19,19],[0,0,19,0,20],[0,0,0,0,21],[0,24,15,40,25],[0,24,23,24,24],[0,26,0,23,0],[0,0,25,0,0],[0,35,0,31,28],[0,0,0,27,0],[0,39,0,0,0],[0,0,0,0,0],[0,0,0,38,27],[0,0,36,0,0],[0,34,0,0,38],[0,0,33,0,0],[0,0,27,36,0],[0,32,0,37,35],[0,0,38,0,36],[0,37,39,33,31],[0,38,29,0,0],[0,0,42,0,41],[0,44,42,0,0],[0,41,44,43,0],[0,41,23,0,0],[0,0,42,0,45],[0,0,0,44,0],[0,0,0,0,5],[0,0,40,0,0],[0,0,0,0,0]]}}
/**
 * @typedef {Object} MiserState
 * @property {number} cp Current Position
 * @property {number} em Error Message.
 * @property {number} gt Got Treasure.
 * @property {boolean} du Door Unlocked.
 * @property {boolean} pf Pool Full.
 * @property {boolean} fb Fire Burning.
 * @property {boolean} bf Bucket Full.
 * @property {boolean} fv Found Vault.
 * @property {boolean} vo Vault Open.
 * @property {boolean} po Portal Open.
 * @property {boolean} ch CHarmed snake.
 * @property {boolean} ps Peeved Snake.
 * @property {boolean} kc Knows Combination.
 * @property {boolean} es EScaped.
 * @property {boolean} jm Jump Made.
 * @property {boolean} gg Got God? [I mean, it is related to the 'drop a religious item or die' and the cross...]
 * @property {number[]} ol Object location array.
 * @property {number[]} pt Object pointer array.
 * @property {Array<number[]>} rPercent Rooms map - N S E W. (new int[49,5])
 */
/** @typedef {Object} GameOverReason
 * @property {string} DIED
 * @property {string} ESCAPED
 * @property {string} QUIT
 */
/**
 * @typedef {Object} MiserResponse
 * @property {string} text Text that will be displayed to the player.
 * @property {boolean|string} gameOver One of 'died', 'escaped', quit', or false.
 * @property {boolean|string} isError Error text.
 */