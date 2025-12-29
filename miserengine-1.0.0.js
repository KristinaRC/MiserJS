

/**
 * I have intentionally used the most primitive types and functions in order to closely match the original
 * Commodore PET source code.
 * 
 * There are lots of opportunities for modernizing or optimizing the code in many different languages, including JavaScript here. 
 * 
 * I thought it best to keep it simple so this code could be ported to non-object-oriented languages such as C, possibly on something as small as an Arduino.
 * It also makes it easier for someone new to programming to add new rooms, floors, or objects.
 *   
 * Input and Output will have to include the complete state of the Miser world. 
 * This engine is stateless.
 */
export default class MiserEngine {

    /**
     * This is where the response text is built, line by line, possibly from multiple methods.  
     * Usually there is some text followed by output from the LOOK command.
     * @type {string}
     */
    #outputText = "";

    /**
     * @type {MiserState}
     */
    // @ts-ignore
    // Ignored because this variable is initialized in the request method rather than the constructor.
    #miserState = null;

    /**
     * Verb.
     * @type {string|null} First word in input: the verb.
     */
    #verbString = null;

    /**
     * Object.
     * @type {string|null} Second word in input: the object. Can be used later, as with the SAY verb.
     */
    #objectString = null;

    /**
     * If the input is greater than #INPUT_STRING_LIMIT characters, trim it.
     * Change this if you add new commands or object names that would exceed this length.
     *  @type {number} To limit how much of the input string is subject to the tokenizer. */
    static #INPUT_STRING_LIMIT = 40;

    constructor() { }

    newGame() {
        // Deep copy the default state.
        this.#miserState = JSON.parse(JSON.stringify(MiserEngine.#defaultState));
        return this.#look();
    }

    /**
     * The primary method for playing the game.  
     * Game state data will have to be restored here.  
     * Updated game state data will be returned with every response.
     * That game state data can be saved in a file, database, local browser storage, etc., and then  
     * it can be sent back with a new request to continue the game.
     *  
     * @param {string} input Player input text.
     * @param {MiserState} miserState The state object. Documented in JSDoc at the end of this file.
     * @returns {MiserResponse}
     */
    request(input, miserState) {

        this.#outputText = '';

        // Simple argument checking here, since you will be using
        // this engine behind your own front-end anyway.
        // Do more strict player input sanitization there.

        let playerInput = input;
        this.#miserState = miserState;

        if (!playerInput || !miserState) {
            return this.#response('No input or miserState was provided.', false, false, false, true);
        }

        // Make sure leading and trailing white-space is deleted.
        playerInput = playerInput.trim();

        // If the inputString is greater than #INPUT_STRING_LIMIT characters, trim it,
        // to minimize the work done in the tokenizer below.
        // Change this (above) if you add new commands or object names that would exceed this length.
        // Default value: 40 characters for a "verb object" input line.
        // 
        if (playerInput.length > MiserEngine.#INPUT_STRING_LIMIT) {
            playerInput = playerInput.substring(0, MiserEngine.#INPUT_STRING_LIMIT);
        }

        // Simple tokenizer to get the words.
        //
        let stringIndex = 0;
        let nextWordStartIndex = 0;
        let words = [];
        // The following will remove leading spaces, spaces between words, and trailing spaces.
        do {
            if ( playerInput.charAt(stringIndex) === ' ' ) {
                if ( stringIndex > nextWordStartIndex) {
                    words.push(playerInput.substring(nextWordStartIndex, stringIndex));
                }
                stringIndex++
                nextWordStartIndex = stringIndex;
                continue;
            }
            stringIndex++;
        } while (stringIndex < playerInput.length);
        // Get the final word, which might be the entire string if there were no spaces in it.
        // JavaScript substring does not include the character at the end index (stringIndex here).
        if ( stringIndex > nextWordStartIndex ) {
            words.push(playerInput.substring(nextWordStartIndex, stringIndex));
        }
        //
        // End tokenizer.

        /** @type {number} Index into verbs array. */
        let i;
        /** @type {number} Index into objects array. */
        let j;

        switch (words.length) {
            case 1:
                // Search the verbs list 
                i = this.#GetVerbIndexForString(words[0]);
                if (i > 0) {
                    this.#verbString = words[0];
                    return this.#action(i, 0);
                }
                else {
                    return this.#errorString50000();
                }
            case 2:
                i = this.#GetVerbIndexForString(words[0]);
                if (i > 0) {
                    this.#verbString = words[0];
                    j = this.#GetObjectIndexForString(words[1]);
                    this.#objectString = words[1];
                    return this.#action(i, j);
                }
                else {
                    return this.#errorString50000();
                }
            default:
                return this.#response(`Please type a one or two word command.\n`);
        }
    }

    /**
     * Implements the BASIC code at lines 900-920.  
     * @param {number} i
     * @param {number} j
     */
    #action(i, j) {
        switch (i) {
            case 1:
            case 2:
                return this.#getTake(j);
            case 3:
            case 4:
            case 5:
                return this.#moveSlidePush(j);
            case 6:
                return this.#open(j);
            case 7:
                return this.#read(j);
            case 8:
            case 29:
                return this.#inventory();
            case 9:
                return this.#quit();
            case 10:
                return this.#drop(j);
            case 11:
                return this.#say(j);
            case 12:
                return this.#pour(j);
            case 13:
                return this.#fill(j);
            case 14:
                return this.#unlock(j);
            case 15:
                return this.#look();
            case 16:
                return this.#go(j);
            case 17:
            case 18:
                return this.#north();
            case 19:
            case 20:
                return this.#south();
            case 21:
            case 22:
                return this.#east();
            case 23:
            case 24:
                return this.#west();
            case 25:
                return this.#score();
            case 26:
                return this.#turn(j);
            case 27:
                return this.#jump();
            case 28:
                return this.#swim();
            // Case 29, INVENTORY, handled above at case 8,29. 
            case 30:
                return this.#fix(j);
            default:
                throw new Error(`In Action method: Verb ${i} not implemented.`);
        }
    }

    /**
     * Case 1 and 2: Get, Take
     * @param {number} j Index into objects array.
     * @returns {MiserResponse}
     */
    #getTake(j) {
        if (j == 0) {
            return this.#errorString50000();
        }

        if (this.#miserState.pt[j] == -1) return this.#response("I am unable to do that.\n");
        if (this.#fna(j) == -1) return this.#response("You're already carrying it.\n");
        if (this.#fna(j) != this.#miserState.cp) return this.#errorString51000();
        this.#miserState.ol[this.#miserState.pt[j]] = -1;
        this.#outputText += "Ok\n";
        // Line 1030
        let x = this.#miserState.pt[j];
        if ((x > 3 && x < 9) || x === 19) {
            this.#miserState.gt += 1;
            this.#outputText += "You got a treasure!\n";
            return this.#response(this.#outputText);
        }

        if (j === 2 && this.#miserState.ol[20] === -2)   // If getting or taking the MAT, and the key is hidden (-2)
        {
            // Sets key location to Front Porch.
            this.#miserState.ol[20] = 0;
            this.#outputText += "You find a door key!\n";
        }

        return this.#response(this.#outputText);

    }

    /**
     * Case 3,4,5: Move, Slide, Push
     * This method implements the functionality of lines 2000-2210 in the original Miser program.
     * @param {number} j Index into objects array.
     * @returns {MiserResponse}
     */
    #moveSlidePush(j) {
        if (j == 0) {
            // Prints the "What?" or "I don't understand that." messages.
            // Lines 210 and 50000 in the original 1981 Miser program.
            return this.#errorString50000();
        }

        // Check the pt[] array for a -1, which means this object doesn't move.
        // Skip the check for the cabinet pt[13], since it can be moved conditionally. Checked after this in the switch.
        if (j != 13) {
            if (this.#miserState.pt[j] == -1) {
                return this.#response("That item stays put.\n");
            }

            if (this.#miserState.ol[this.#miserState.pt[j]] != this.#miserState.cp && this.#miserState.ol[this.#miserState.pt[j]] != -1) {
                // "I don't see it here."
                return this.#errorString51000();
            }
        }

        // Only the CABINET, MAT, and RUG can move.

        switch (j) {
            // Mat
            case 2:
                // If brass door key not found/hidden (-2).
                if (this.#miserState.ol[20] == -2) {
                    // Set object location (ol[20]) of key (20) to the front porch (rString[0]).
                    this.#miserState.ol[20] = 0;
                    return this.#response("You find a door key!\n");
                }
                break;
            // Oriental Rug
            case 10:
                // If trapdoor not found/hidden (-2)
                if (this.#miserState.ol[16] == -2) {
                    // Found trapdoor. Location is now in the Formal Parlor, so it will be observed on a new LOOK command.
                    this.#outputText += "You find a trap door!\n";
                    this.#miserState.ol[16] = 6;
                    return this.#look();
                }
                break;
            // Cabinet
            case 13:
                // CP=5=Red-Walled Room rString[5]
                // rPercent(5,3)=0 means EAST direction is unavailable, meaning the vault has not been found yet.
                // So this means, 'If in Red-Walled Room and EAST direction unavailable, move the cabinet and find the vault'.
                if (this.#miserState.cp == 5 && this.#miserState.rPercent[5][3] == 0) {
                    // fv is Found Vault: Set it to true.
                    this.#miserState.fv = true;
                    this.#outputText += "Behind the cabinet is a vault!\n";
                    return this.#look();
                }
                else {
                    return this.#response("That item stays put.\n");
                }
        }

        return this.#response("Moving it reveals nothing.\n");
    }

    /**
     * CASE 6: Open.\
     * Lines 4000-4260 in the original Miser program from 1981.\
     * The only objects that have a response for open are:\
     * Valve (7), Book (11), Door (12), Cabinet (13), Organ (16),  
     * Bag (22), and Vault (27).
     * @param {number} j Index into objects array.
     * @returns {MiserResponse}
     */
    #open(j) {


        switch (j) {
            // Nothing to open
            case 0:
                return this.#errorString50000();
            // Valve
            case 7:
                return this.#response("Try turning it.\n");
            // Book
            case 11:
                if ((this.#miserState.ol[this.#miserState.pt[j]] == this.#miserState.cp) || (this.#miserState.ol[this.#miserState.pt[j]] == -1)) {
                    return this.#response("Scrawled in blood on the inside front cover is the message, \"'Victory' is a prize-winning word\".\n");
                }
                break;
            // Door
            case 12:
                switch (this.#miserState.cp) {
                    // Front Porch
                    case 0:
                        // Door unlocked?
                        if (this.#miserState.du) {
                            return this.#response("It's already open.\n");
                        }
                        else {
                            return this.#response("Sorry, the door is locked.\n");
                        }
                    // Formal Parlor
                    case 6:
                        this.#outputText += "You open the door. You lean over to peer in, and you fall in!\n";
                        this.#miserState.cp = 47;
                        return this.#look();
                }
                return this.#errorString51000();
            // Cabinet
            case 13:
                // In Red-Walled room? (CP=5)
                if (this.#miserState.ol[26] == this.#miserState.cp) {
                    return this.#response("The cabinet is empty and dusty.\nScribbled in dust on one shelf are the words, 'behind me'.\n");
                }
                else {
                    return this.#errorString51000();
                }
            // Organ
            case 16:
                // In Ballroom?
                if (this.#miserState.cp == 21) {
                    if (this.#miserState.gg) {
                        if (this.#miserState.ol[24] != -2) {
                            // Hide the 'ORGAN IN THE CORNER' and reveal the 'OPEN ORGAN IN THE CORNER'
                            this.#miserState.ol[24] = -2;
                            this.#miserState.ol[25] = 21;
                            // Reveal the Parachute Ripcord
                            this.#miserState.ol[17] = 21;
                            // Reveal the Ruby Slippers
                            this.#miserState.ol[19] = 21;

                            this.#outputText += "As you open it, several objects suddenly appear!\n";
                            return this.#look();
                        }
                        else {
                            return this.#response("It's already open.\n");
                        }
                    }
                    else {
                        return this.#response("It's stuck shut.\n");
                    }
                }
                else {
                    // "I don't see it here."
                    return this.#errorString51000();
                }
            // Bag
            case 22:
                // If in the vault or carrying it 
                if ((this.#miserState.ol[this.#miserState.pt[j]] == this.#miserState.cp) || (this.#miserState.ol[this.#miserState.pt[j]] == -1)) {
                    return this.#response("The bag is knotted securely.\nIt won't open.\n");
                }
                else {
                    return this.#errorString51000();
                }
            // Vault
            case 27:
                // If in Red-Walled Room and FV=true (found vault)
                if ((this.#miserState.cp == 5) && (this.#miserState.fv)) {
                    // Vault open?
                    if (this.#miserState.vo) {
                        return this.#response("It's already open.\n");
                    }
                    else {
                        return this.#response("I can't, it's locked.\n");
                    }
                }
                else {
                    return this.#errorString51000();
                }
        }

        return this.#response("I don't know how to open that.\n");
    }

    /**
     * CASE 7: Read.  
     * Lines 5000-5050 in the original Miser program from 1981.
     * @param {*} j Index into objects array. 
     * @returns 
     */
    #read(j) {
        // Second word to act on?
        if (j == 0) {
            // Returns 'What?' or 'I don't understand'. 
            return this.#errorString50000();
        }

        if (this.#miserState.pt[j] == -1) {
            return this.#response("There's nothing written on that.\n");
        }

        if (!this.#isObjectPresent(j)) {
            // Returns "I don't see it here."
            return this.#errorString51000();
        }

        switch (j) {
            // PAPER
            case 3:
                // Player now knows the combination to the vault
                this.#miserState.kc = true;
                return this.#response("It says, '12-35-6'.\nhmm.. looks like a combination.\n");

            // BOOK
            case 11:
                return this.#response("The front cover is inscribed in Greek.\n");

            default:
                return this.#response("There's nothing written on that.\n");
        }
    }

    /**
     * Case 8,29: Inventory.  
     * Output a list of all objects the player is carrying.  
     * Lines 6000-6040 in the original Miser program from 1981.
     * @returns {MiserResponse}
     */
    #inventory() {
        this.#outputText += "You are carrying the following:\n\n";

        let fi = 0;
        for (let x = 1; x < 28; x++) {
            // Carrying object omString[x]?  
            if (this.#miserState.ol[x] == -1) {
                fi = 1;
                this.#outputText += `${MiserEngine.#omString[x]}\n`;
                // Bucket full?
                if (x == 1 && this.#miserState.bf) {
                    this.#outputText += "  The bucket is full of water.\n";
                    continue;
                }
                if (x == 14) {
                    this.#outputText += "  (Better fix it)\n";
                }
            }
        }

        // Found items?
        if (fi == 1) {
            return this.#response(this.#outputText);
        }
        else {
            return this.#response(this.#outputText += "Nothing at all.\n");
        }
    }

    /**
     * Case 9: Quit.  
     * Lines 7000-7150 in the original Miser program from 1981.
     * @returns {MiserResponse}
     */
    #quit() {
        return this.#quitOrEndGame(true);
    }

    /**
     * Case 10: Drop.  
     * Lines 8000-8221 in the original Miser program from 1981.
     * @param {number} j Index into objects array.
     * @returns {MiserResponse}
     */
    #drop(j) {
        // Preservation of bug in original code
        if (this.#miserState.pt[j] == -1) {
            this.#outputText += "?ILLEGAL QUANTITY ERROR IN LINE 8000\n\n";
            this.#outputText += "** You have encountered a bug that existed in the original Miser program from 1981. **\n\n";
            this.#outputText += "** This bug is being reproduced here to preserve the experience a player would have had playing this game in 1981 on one of the Commodore Pet computers. Except for one thing...the game doesn't just end unexpectedly here as it did before. You get to keep playing as if nothing bad happened!\n\n";
            this.#outputText += "*Interesting side note: All the translations of this game that I have seen so far [December 2025] still contain this bug. It's also in the program listings reprinted in several books and magazines. -Kristina\n";
            return this.#response(this.#outputText);
        }

        // Carrying this object?
        if (this.#miserState.ol[this.#miserState.pt[j]] != -1) {
            return this.#response("You aren't carrying it!\n");
        }

        // Ok, player is carrying the object represented by pt[j], since ol[pt[j]] has a value of -1 here.
        // The only objects that DROP should provide a special response for are the 5 treasures, the Penny, and the Cross.
        // All other objects just get dropped with an 'Ok' response.

        // Check for one of the 5 treasures
        switch (this.#miserState.pt[j]) {
            // One of the 5 treasures
            // Remember that the value of pt[j] is an index into the omString array (om$() in original program).
            case 4:
            case 5:
            case 7:
            case 8:
            case 19:
                return this.#response("Don't drop *treasures*!\n");
        }

        // Check for a Penny or a Cross specifically. All other objects should just be dropped with a response of "Ok"
        switch (j) {
            // Drop Penny
            case 19:
                // In Portico?
                if (this.#miserState.cp == 19) {
                    // The Penny is being carried, and the player is in the Portico.
                    // DROP PENNY action

                    // Update the EAST (3) direction of the BALLROOM (21) to point toward the CHAPEL (22)
                    // Player can now move from the BALLROOM to the CHAPEL. 
                    // Modifies rPercent array.
                    this.#miserState.rPercent[21][3] = 22;
                    // Update object location of the PENNY to 'hidden'(-2)
                    this.#miserState.ol[12] = -2;
                    return this.#response("As the penny sinks below the surface of the pool, a fleeting image of a chapel with dancers outside appears.\n");
                }
                break;
            // Drop Cross.
            case 20:
                // In Chapel?
                if (this.#miserState.cp == 22) {
                    // The CROSS is being carried, and the player is in the Chapel.
                    // DROP CROSS action
                    // LINES 8200-8221 in the original program.

                    // Still trying to figure out what GG could stand for.
                    // If GG is TRUE it means the player can OPEN the ORGAN in the BALLROOM.
                    // Prior to dropping the CROSS here, this wasn't possible.
                    // GG = 'Got God'? You know...chapel...cross...God...
                    this.#miserState.gg = true;
                    // RUSTY CROSS becomes 'hidden' (-2) 
                    this.#miserState.ol[11] = -2;
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
                    return this.#response("Even before it hits the ground, the cross fades away!\n\nThe tablet has disintegrated.\n\nYou hear music from the organ.\n");
                }
                break;
        }

        // If the PENNY or the CROSS weren't in their special action locations in the above switch statement, they will be dropped here.
        // Any other objects being carried will be dropped here as well.
        // ol[pt[j]] (object location) gets updated to the current position. (CP) 
        this.#miserState.ol[this.#miserState.pt[j]] = this.#miserState.cp;
        return this.#response("Ok\n");
    }

    /**
     * Case 11: Say.  
     * Lines 9000-9300 in the original Miser program from 1981.
     * @param {number} j Index into objects array.
     * @returns {MiserResponse}
     */
    #say(j) {
        switch (j) {
            // No second word to say
            case 0:
                return this.#response("Say what???\n");
            // Lines 9100-9120 Say ritnew
            case 14:
                // In Pantry?
                if (this.#miserState.cp == 4) {
                    // Charmed Snake?
                    if (this.#miserState.ch) {
                        return this.#response("Nothing happens.\n");
                    }
                    else {
                        this.#miserState.ch = true;
                        // Vicious snake disappears from conservatory.
                        this.#miserState.ol[2] = -2;
                        // Charmed Snake appears in conservatory. (rString[4])
                        this.#miserState.ol[3] = 4;
                        return this.#response("The snake is charmed by the very utterance of your words.\n");
                    }
                }
                else {
                    return this.#response("Nothing happens.\n");
                }
            // Lines 9200-9220 Say victory
            case 15:
                // In Trophy room?
                if (this.#miserState.cp == 8) {
                    // Portal open?
                    if (this.#miserState.po) {
                        return this.#response("Nothing happens.\n");
                    }
                    else {
                        // Set Portal Open
                        this.#miserState.po = true;
                        // Set Trophy Room north direction to point toward rString[17], which is the Game Room.
                        // Modifies rPercent array.
                        this.#miserState.rPercent[8][1] = 17;
                        // 'Portal in the North Wall' appears in the Trophy Room (rString[8]).
                        this.#miserState.ol[18] = 8;
                        return this.#response("A portal has opened in the north wall!!\n");
                    }
                }
                else {
                    return this.#response("Nothing happens.\n");
                }
            // Line 9300 Say Xyzzy, Say Plugh (These are magic words used in the 'Colossal Cave Adventure' game from 1975!)
            case 29:
            case 30:
                return this.#response("A hollow voice says, 'Wrong adventure'.\n");
            default:
                return this.#response(`Okay, \'${this.#objectString}\'.\nNothing happens.\n`);
        }

    }

    /**
     * CASE 12: Pour.  
     * Lines 10000 to 10060 in the original Miser program from 1981.  
     * @param {number} j Index into objects array.
     * @returns {MiserResponse}
     */
    #pour(j) {
        // Only the bucket (oString[4]) can be poured.
        if (j != 4) {
            return this.#response("I wouldn't know how.\n");
        }

        if (!this.#isObjectPresent(j)) {
            return this.#errorString51000();
        }

        // Is bucket empty?
        if (!this.#miserState.bf) {
            return this.#response("The bucket is already empty.\n");
        }

        switch (this.#miserState.cp) {
            // BLUE DRAWING ROOM
            case 10:
                // Is fire burning?
                if (this.#miserState.fb) {
                    // Fire Burning becomes FALSE. The fire is out now.
                    this.#miserState.fb = false;
                    // Bucket is no longer full.
                    this.#miserState.bf = false;
                    this.#outputText += "Congratulations! You have vanquished the flames.\n";
                    return this.#look();
                }
                break;
            // PORTICO
            case 19:
                return this.#response("Ok\n");
            // 
        }
        return this.#response("The water disappears quickly.\n");
    }

    /**
     * CASE 13: Fill.  
     * Lines 11000-11070 in the original Miser program from 1981.  
     * @param {number} j Index into objects array.
     * @returns {MiserResponse}
     */
    #fill(j) {
        if (j == 0) {
            // "What?" or "I don't understand."
            return this.#errorString50000();
        }

        if (this.#miserState.pt[j] == -1) {
            return this.#response("That wouldn't hold anything.\n");
        }


        if (!this.#isObjectPresent(j)) {
            // "I don't see it here."
            return this.#errorString51000();
        }

        // Is this the bucket?
        if (j == 4) {
            // Is the bucket full?
            if (this.#miserState.bf) {
                return this.#response("It's already full.\n");
            }
            switch (this.#miserState.cp) {

                // Bucket can ony be filled in the PORTICO and BACK YARD near the faucet.
                case 19:
                case 23:
                    this.#miserState.bf = true;
                    return this.#response("Your bucket is now full.\n");
                // POOL AREA
                case 25:
                    if (this.#miserState.pf) {
                        return this.#response("I'd rather stay away from the mercury.\n");
                    }
                    break;
            }
            return this.#response("I don't see any water here.\n");
        }
        else {
            // Only the bucket can be filled
            return this.#response("That wouldn't hold anything.\n");
        }
    }

    /**
     * Unlock.  
     * Only the DOOR, TRAPDOOR, and VAULT are acted on here.  
     * This method implements the functionality of lines 11000 to 11070  
     * in the original Miser program from 1981.
     * @param {number} j Index into objects array.
     * @returns {MiserResponse}
     */
    #unlock(j) {
        // Only the DOOR/TRAPDOOR (12) and the VAULT (27) can be unlocked
        switch (j) {
            // No object
            case 0:
                // Return "What?" or "I don't understand."
                return this.#errorString50000();
            // Door or Trapdoor
            case 12:
                switch (this.#miserState.cp) {
                    // Door at Front Porch (CP=0)
                    case 0:
                        if (this.#miserState.du) {
                            return this.#response("It's already unlocked.\n");
                        }
                        // Carrying the key? (omString[20])
                        if (this.#miserState.ol[20] != -1) {
                            return this.#response("I need a key.\n");
                        }
                        else {
                            this.#miserState.du = true;

                            this.#outputText += "The door easily unlocks and swings open.\n";
                            return this.#look();
                        }
                    // Trapdoor in Formal Parlor (CP=6) 
                    case 6:
                        // Trapdoor Hidden? 
                        if (this.#miserState.ol[16] != -2) {
                            return this.#response("The trapdoor has no lock.\n");
                        } else {
                            return this.#response("I don't see it here.\n");
                        }
                    default:
                        // "I don't see it here."
                        return this.#errorString51000();
                }
            // Vault
            case 27:
                // In Red-Walled Room?
                if (this.#miserState.cp == 5) {
                    // Vault open?
                    if (this.#miserState.vo) {
                        return this.#response("It's already open.\n");
                    }
                    // Found vault?
                    if (this.#miserState.fv) {
                        // Know combination?
                        if (this.#miserState.kc) {
                            this.#miserState.vo = true;
                            // Modifies rPercent array.
                            this.#miserState.rPercent[5][3] = 46;

                            this.#outputText += "Ok, let's see. 12..35..6..\n<CLICK!> The door swings open.";
                            return this.#look();
                        }
                        else {
                            return this.#response("I don't know the combination.\n");
                        }
                    }
                    else {
                        // "I don't see it here."
                        return this.#errorString51000();
                    }
                }
                else {
                    // "I don't see it here."
                    return this.#errorString51000();
                }
            default:
                return this.#response("I wouldn't know how to unlock one.\n");
        }
    }

    /**
     * CASE 15: Look.  
     * Lines 14000-14170 in the original Miser program from 1981.  
     * @returns {MiserResponse}
     */
    #look() {
        // Line 14000 - Print current position
        let cp = this.#miserState.cp;
        if ( cp == 22 && this.#miserState.gg) {
            // If in chapel, and already dropped the cross, print a different room description.
            this.#outputText += "\nYou are in the chapel.\n";
        } else {
            this.#outputText += `\nYou are in the ${MiserEngine.#rString[cp]}.\n`;
        }

        // Lines 14010-14030 Print list of all objects at this location (CP variable)
        for (let x = 1; x < 29; x++) {
            if (this.#miserState.ol[x] == cp) {
                // Object found at this location (CP).

                // Special case for the organ.
                if ( x == 24 && this.#miserState.gg ) {
                    this.#outputText += `\nThere is a closed organ playing music in the corner here.\n`;
                } else {
                    this.#outputText += `\nThere is a ${MiserEngine.#omString[x]} here.\n`;
                }
                // If the plastic bucket is here and it is full (BF=true).
                if ((x == 1) && this.#miserState.bf) {
                    this.#outputText += "  The bucket is full of water.\n";
                }
            }
        }

        // Special actions depending on current position (CP)

        switch (this.#miserState.cp) {
            // Line 14127 Front Porch
            case 0:
                // Door unlocked?
                if (this.#miserState.du) this.#outputText += "\nAn open door leads north.\n";
                break;
            // Lines 14125-14126 Red-Walled Room
            case 5:
                // Found vault?
                if (this.#miserState.fv) this.#outputText += "\nThere is a vault in the east wall.\n";
                if (this.#miserState.vo) this.#outputText += "The vault is open.\n";
                break;
            // Lines 14060-14080 and 14120 Blue Drawing Room
            case 10:
                // Fire Burning
                if (this.#miserState.fb) {
                    this.#outputText += "\nThere is a hot fire on the south wall!\nIf I go that way I'll burn to death!\n";
                }
                else {
                    this.#outputText += "\nThere is evidence of a recent fire here.\n";
                }
                break;
            // Lines 14090-14105 Pantry
            case 16:
                this.#outputText += "\nA rich, full voice says, 'Ritnew is a charming word'.\n";
                break;
            // Line 14115 Back Yard
            case 23:
                this.#outputText += "\nThere is a leaky faucet nearby.\n";
                break;
            // Lines 14040-14056 Pool Area
            case 25:
                // Pool full?
                if (this.#miserState.pf) {
                    this.#outputText += "\nThe pool is full of liquid mercury!\n";
                } else {
                    this.#outputText += "\nThe pool's empty.\n";
                    if (this.#miserState.ol[7] == 48) {
                        this.#outputText += "\nI see something shiny in the pool!\n";
                    }
                }
                break;
            // Line 14110 Pump House
            case 26:
                this.#outputText += "\nThere is a valve on one of the pipes.\n";
                break;
            // Line 14130 Bottom of Swimming Pool
            case 48:
                return this.#response(this.#outputText);
        }

        // Lines 14130-14170
        // Print all available direction commands from this location.
        this.#outputText += `\nObvious Exits:\n`;
        if (this.#miserState.rPercent[this.#miserState.cp][1] > 0) this.#outputText += "N ";
        if (this.#miserState.rPercent[this.#miserState.cp][2] > 0) this.#outputText += "S ";
        if (this.#miserState.rPercent[this.#miserState.cp][3] > 0) this.#outputText += "E ";
        if (this.#miserState.rPercent[this.#miserState.cp][4] > 0) this.#outputText += "W ";
        // Add newline.
        this.#outputText += "\n";

        return this.#response(this.#outputText);
    }

    /**
     * CASE 16: Go.  
     * Lines 15000-15080 in the original Miser program from 1981.  
     * @param {number} j Index into objects array.
     * @returns {MiserResponse}
     */
    #go(j) {
        // Valid objects are Ladder(8), Stairs(18), and Pool(28).
        switch (j) {
            // Ladder
            case 8:
                // In bottom of pool?
                if (this.#miserState.cp == 48) {
                    // Move from 'bottom of swimming pool' to 'Pool Area'
                    this.#miserState.cp = 25;

                    return this.#look();
                }
                else {
                    // Print "I don't see it here."
                    return this.#errorString51000();
                }
            // Stairs
            case 18:
                // In 'Great Hall' or 'Middle of the western hallway'?
                switch (this.#miserState.cp) {
                    // Great Hall.
                    case 2:
                        // Carrying sword?
                        if (this.#miserState.ol[9] == -1) {
                            // Move from Great Hall to 'Middle of the western hallway'
                            this.#miserState.cp = 27;

                            this.#outputText += "The suits of armor try to stop you, but you fight them off with your sword.\n";
                            return this.#look();
                        }
                        else {
                            return this.#response("The suits of armor prevent you from going up!\n");
                        }
                    // Middle of the western hallway.
                    case 27:
                        // Move to Great Hall
                        this.#miserState.cp = 2;
                        return this.#look();
                    default:
                        // Print "I don't see it here."
                        return this.#errorString51000();
                }
            // Pool
            case 28:
                // Pool full?
                if (this.#miserState.pf) {
                    return this.#response("The pool is full of mercury!\n");
                }
                else {
                    // Move to bottom of swimming pool
                    this.#miserState.cp = 48;

                    return this.#look();
                }

            default:
                return this.#errorString50000();
        }
    }

    /**
     * CASE 17,18: North.  
     * Lines 16000-16020 in the original Miser program from 1981.  
     * @returns {MiserResponse}
     */
    #north() {
        if (this.#miserState.cp == 0 && !this.#miserState.du) {
            this.#outputText += "The door is locked shut.\n";
            return this.#response(this.#outputText);
        }

        if (this.#miserState.rPercent[this.#miserState.cp][1] == 0) {

            return this.#errorString52000();

        }

        if (this.#miserState.cp == 0) this.#outputText += "The door slams shut behind you!\n";

        this.#miserState.cp = this.#miserState.rPercent[this.#miserState.cp][1];
        return this.#look();
    }

    /**
     * CASE 19,20: South.  
     * Lines 17000 to 17050 in the original Miser program from 1981.  
     * @returns {MiserResponse}
     */
    #south() {
        if (this.#miserState.cp == 10 && this.#miserState.fb) {
            this.#outputText += "You have burnt to a crisp!\n";

            return this.#response(this.#outputText, true, true);
        }

        const snakeAction = this.#checkSnake();
        if (snakeAction != null) {
            return snakeAction;
        }

        if (this.#miserState.rPercent[this.#miserState.cp][2] == 0) return this.#errorString52000();
        this.#miserState.cp = this.#miserState.rPercent[this.#miserState.cp][2];

        return this.#look();
    }


    /**
    * CASE 21,22: East.  
    * Lines 17010 to 17050 in the original Miser program from 1981.  
    * @returns {MiserResponse}
    */
    #east() {
        const snakeAction = this.#checkSnake();
        if (snakeAction != null) {
            return snakeAction;
        }

        if (this.#miserState.rPercent[this.#miserState.cp][3] == 0) return this.#errorString52000();
        this.#miserState.cp = this.#miserState.rPercent[this.#miserState.cp][3];

        return this.#look();
    }

    /**
    * CASE 23,24: West.  
    * Lines 19000 to 19010 in the original Miser program from 1981.  
    * @returns {MiserResponse}
    */
    #west() {
        if (this.#miserState.rPercent[this.#miserState.cp][4] == 0) return this.#errorString52000();

        this.#miserState.cp = this.#miserState.rPercent[this.#miserState.cp][4];
        return this.#look();
    }

    /**
    * CASE 25: Score.  
    * Lines 20000 to 20060 in the original Miser program from 1981.  
    * @returns {MiserResponse}
    */
    #score() {
        this.#outputText += `Your current score is: ${this.#miserState.gt * 20} points.\n(100 possible)\n`;
        this.#outputText += `\nYour rank is: ${MiserEngine.#rank[this.#miserState.gt]}\n`;
        let ranksLeft = (MiserEngine.#rank.length-1) - this.#miserState.gt;
        if ( ranksLeft == 1) {
            this.#outputText += "  (There is only one rank left for you to achieve!)\n";
        } else {
            this.#outputText += `  (There are ${ranksLeft} more ranks you can achieve.\n`;
        }
        return this.#response(this.#outputText);
    }

    /**
    * CASE 26: Turn.  
    * Only the VALVE can be turned.  
    * Lines 21000 to 21070 in the original Miser program from 1981.  
    * @param {number} j Index into objects array.
    * @returns {MiserResponse}
    */
    #turn(j) {
        if (j != 7) {
            return this.#response("I don't know how to turn such a thing.\n");
        }

        if (this.#miserState.cp != 26) {
            return this.#errorString51000();
        }

        // Toggle POOL FULL
        this.#miserState.pf = !this.#miserState.pf;
        return this.#response("With much effort, you turn the valve 5 times. You hear the sound of liquid\nflowing through the pipes.\n");
    }

    /**
    * CASE 27: Jump.  
    * Can only JUMP from MIDDLE OF THE WESTERN HALLWAY, FRONT BALCONY, and REAR BALCONY.  
    * Lines 22000 to 22540 in the original Miser program from 1981.  
    * @returns {MiserResponse}
    */
    #jump() {
        let playerDied = false;

        switch (this.#miserState.cp) {
            case 27:
                // MIDDLE OF THE WESTERN HALLWAY
                this.#outputText += "You jump...\n";
                if (this.#miserState.jm) {
                    this.#outputText += "Now you've done it. You ignored\nmy warning, and as a result\nyou have broken your neck!\n\nYou are dead.";
                    playerDied = true;
                }
                else {
                    this.#miserState.jm = true;
                    this.#miserState.cp = 2;
                    this.#outputText += "You have landed down-stairs,\nand narrowly escaped serious\ninjury. Please don't try it again.\n";
                    this.#look();
                }
                break;
            case 29:
            case 32:
                this.#outputText += `You jump...\n`;

                // Next action depends on the three possible states of the parachute in the players inventory:
                //      1) No parachute. Not in inventory.
                //      2) Carrying the parachute that hasn't been fixed with the ripcord.
                //      3) Carrying a fully functional parachute.

                if (this.#miserState.ol[14] == -1) {
                    // Have Parachute with no ripcord
                    this.#outputText += "There is no way to open the parachute!\n";
                    this.#outputText += "You hit the ground.\n";
                    this.#outputText += "You have broken your neck!\n\n";
                    this.#outputText += "You are dead.";
                    playerDied = true;
                    break;

                }
                else if (this.#miserState.ol[27] == -1) {
                    // Have fully functional parachute
                    this.#outputText += "You yank the ripcord and the\n'chute comes billowing out.\n";
                    if (this.#miserState.cp == 32) {
                        // At rear balcony, so change current position to HEDGE MAZE (40)
                        this.#miserState.cp = 40;
                        return this.#look();
                    }
                    else
                        if (this.#miserState.cp == 29) {
                            this.#outputText += "You land safely.\n\nCongratulations on escaping!\n";
                            this.#miserState.es = true;
                            return this.#quitOrEndGame(true, false, true);
                        }
                }
                else {
                    this.#outputText += "You hit the ground.\n";
                    this.#outputText += "You have broken your neck!\n\n";
                    this.#outputText += "You are dead.";
                    playerDied = true;
                    break;
                }

                break;

            default:
                this.#outputText += "There's nowhere to jump.";
                break;
        }

        if (playerDied) {
            return this.#response(this.#outputText, true, true);
        } else {
            return this.#response(this.#outputText);
        }
    }

    /**
    * CASE 28: Swim.  
    * Lines 24000 to 24030 in the original Miser program from 1981.  
    * @returns {MiserResponse}
    */
    #swim() {
        switch (this.#miserState.cp) {
            // Portico
            case 19:
                return this.#response("The water is only a few inches deep.\n");
            // Pool area
            case 25:
                // Pool full?
                if (this.#miserState.pf) {
                    return this.#response("In mercury? No way!\n");
                }
                else {
                    return this.#response("The pool is empty.\n");
                }
            default:
                return this.#response("There's nothing here to swim in!\n");
        }
    }

    // Case 29: INVENTORY -> Handled at Case 8 above (Case 8,29:)

    /**
    * CASE 30: Fix.  
    * Lines 25000 to 25070 in the original Miser program from 1981.  
    * @param {number} j Index into objects array.
    * @returns {MiserResponse}
    */
    #fix(j) {
        switch (j) {
            // Nothing to fix
            case 0:
                return this.#errorString50000();
            // Valve
            case 7:
                return this.#response("I ain't no plumber.\n");
            case 17:
                // If parachute with no ripcord isn't at current position AND not carrying it
                if (!this.#isObjectPresent(j)) {
                    // Print "I don't see it here."
                    return this.#errorString51000();
                }

                if (this.#miserState.ol[14] == -2) {
                    return this.#response("It's already fixed.\n");
                }

                // If not carrying the ripcord
                if (this.#miserState.ol[17] != -1) {
                    return this.#response("I need a ripcord.\n");
                }

                // Parachute with no ripcord and ripcord is here, so fix the parachute.
                // Reveal 'repaired parachute' at the same location as 'parachute with no ripcord'
                this.#miserState.ol[27] = this.#miserState.ol[14];
                // Hide 'parachute with no ripcord'
                this.#miserState.ol[14] = -2;
                // Update pointer to omString[27] 'repaired parachute'
                this.#miserState.pt[17] = 27;
                // Update parachute ripcord location to the front porch. Weird, but it works to hide it.
                this.#miserState.ol[17] = 0;
                return this.#response("I'm no expert, but I think it'll work.\n");
            default:
                return this.#response("I wouldn't know how.\n");
        }
    }

    #checkSnake() {
        if (this.#miserState.cp == 4 && !this.#miserState.ch) {
            if (!this.#miserState.ps) {
                this.#miserState.ps = true;
                return this.#response("The snake is about to attack!\n");
            } else {
                return this.#response("The snake bites you!\nYou are dead.\n", false, true);
            }
        } else {
            return null;
        }
    }

    #quitOrEndGame(isGameOver = false, playerDied = false, playerEscaped = false) {
        this.#outputText += `\nYou accumulated ${this.#miserState.gt} treasures, \n for a score of ${this.#miserState.gt * 20} points.\n(100 Possible)\n`;
        if (this.#miserState.es) {
            this.#miserState.gt++;
        }
        else {
            this.#outputText += "\nHowever, you did not escape.\n";
        }

        this.#outputText += `\nThis puts you in a class of:\n${MiserEngine.#rank[this.#miserState.gt]}\n`;

        if (this.#miserState.gt != 6) {
            this.#outputText += `\nBetter luck next time!\n`;
        }

        return this.#response(this.#outputText, isGameOver, playerDied, playerEscaped);
    }

    /**
     * Creates new output arguments.
     * @param {string} outputText String to return.
     * @param {boolean} [isGameOver=false]
     * @param {boolean} [playerDied=false]
     * @param {boolean} [playerEscaped=false]
     * @param {boolean} [isError=false] Signal an error to the host program.
     * @returns {MiserResponse}
     */
    #response(outputText, isGameOver = false, playerDied = false, playerEscaped = false, isError = false) {

        return {
            text: outputText,
            isGameOver: isGameOver,
            playerDied: playerDied,
            playerEscaped: playerEscaped,
            isError: isError,
            miserState: this.#miserState
        };
    }

    /**
     * Line 810 in original program from 1981.
     * @param {string} s 
     * @returns {number} Index into verbs[] array, or 0 if not found.
     */
    #GetVerbIndexForString(s) {
        s = s.toLowerCase();
        if (s.length > 4) {
            s = s.substring(0, 4);
        }

        // This can be done more efficiently in most languages, but this is how it's done in the original 1981 program at Line 810.
        for (let x = 1; x < 31; x++) {
            if (s === MiserEngine.#verbs[x]) {
                // Match. Return array index into the verbs array.
                return x;
            }
        }

        return 0;
    }

    /**
     * @param {string} s 
     * @returns {number} Index into objects[] array, or 0 if not found.
     */

    #GetObjectIndexForString(s) {
        s = s.toLowerCase();
        if (s.length > 4) {
            s = s.substring(0, 4);
        }

        for (let x = 1; x < 31; x++) {
            if (s === MiserEngine.#objects[x]) {
                // Match. Return array index into the objects array.
                return x;
            }
        }

        return 0;
    }

    /**
     * Returns one of "What?" or "I don't understand."
     * @returns {MiserResponse}
     */
    #errorString50000() {
        this.#outputText += `${MiserEngine.#hString[this.#miserState.em]}\n`;
        // Alternate between hString[1] and hString[2].
        this.#miserState.em = 3 - this.#miserState.em;
        return this.#response(this.#outputText);
    }

    /**
     * Returns "I don't see it here."
     * @returns {MiserResponse}
     */
    #errorString51000() {
        this.#outputText += `I don't see it here.\n`;
        return this.#response(this.#outputText);
    }

    /**
     * Line 52000 in the original 1981 program.  
     * Tried to go in a direction not defined in r%(room number, N, S, E, W)  
     * Returns "It's impossible to go that way."
     * @returns {MiserResponse} 
     */
    #errorString52000() {
        this.#outputText += "It's impossible to go that way.\n";
        return this.#response(this.#outputText);
    }

    /**
     * If object is at current position (cp) or being carried (-1), it is present.
     * @param {number} j 
     * @returns {boolean}
     */
    #isObjectPresent(j) {
        if ((this.#fna(j) == this.#miserState.cp) || (this.#fna(j) == -1)) {
            return true;
        }
        else {
            return false;
        }
    }

    /**
     * Returns an object location value for the object typed after the verb on an input line.
     * @param {number} x Index into objects array.
     */
    #fna(x) {
        return this.#miserState.ol[this.#miserState.pt[x]];
    }

    /* #####  Start of STATIC DATA  ###### */
    /* This data is not modified in the original source code. */

    /**
     * List of actions, such as LOOK, GET, MOVE, etc.  
     * v$ (verbs) begins at 1 in the original program. Setting index 0 to "" here.  
     * Defined at Line 500 in the original program from 1981.
     * STATIC DATA: This array was not modified in the original source code.
     * @type {string[]}
     */
    static #verbs = [
        "",
        "get",
        "take",
        "move",
        "slid",
        "push",
        "open",
        "read",
        "inve",
        "quit",
        "drop",
        "say",
        "pour",
        "fill",
        "unlo",
        "look",
        "go",
        "nort",
        "n",
        "sout",
        "s",
        "east",
        "e",
        "west",
        "w",
        "scor",
        "turn",
        "jump",
        "swim",
        "i",
        "fix"
    ];

    /**
     * List of objects.
     * o$ (objects) begins at 1 in the original program. Setting index 0 to "" here.
     * 
     * STATIC DATA: This array was not modified in the original source code.
     * @type {string[]}
     */
    static #objects = [
        "",
        "ripc",
        "mat",
        "pape",
        "buck",
        "swor",
        "key",
        "valv",
        "ladd",
        "slip",
        "rug",
        "book",
        "door",
        "cabi",
        "ritn",
        "vict",
        "orga",
        "para",
        "stai",
        "penn",
        "cros",
        "leaf",
        "bag",
        ">$<",
        ">$<",
        "ring",
        "pain",
        "vaul",
        "pool",
        "xyzz",
        "plug"
    ];

    /**
     * Error messages.  
     * Alternates between index 1 and 2 via the em variable.  
     * em starts at 1 in the program.  
     * em=3-em changes that to em=2 and  
     * the next em=3-em changes that em=2 to em=1.  
     * STATIC DATA: This array was not modified in the original source code.
     * @type {string[]}
     */
    static #hString = [
        "",
        "What?",
        "I don't understand that."
    ];

    /**
     * Rank descriptions.  
     * STATIC DATA.
     * @type {string[]}
     */
    static #rank = [
        "<Beginner Adventurer>",
        "<Amateur Adventurer>",
        "<Journeyman Adventurer>",
        "<Experienced Adventurer>",
        "<Pro Adventurer>",
        "<Master Adventurer>",
        "<Grandmaster Adventurer>"
    ];

    static #omString = [
        "",  // om$ begins at 1 in the original program. Setting index 0 to "" here.
        "plastic bucket",
        "vicious snake",
        "charmed snake",
        "*golden leaf*",
        "*bulging moneybag*",
        ">$<",
        "*diamond ring*",
        "*rare painting*",
        "sword",
        "mat",
        "rusty cross",
        "penny",
        "piece of paper",
        "parachute with no ripcord",
        "oriental rug",
        "trapdoor marked 'danger'",
        "parachute ripcord",
        "portal in the north wall",
        "pair of *ruby slippers*",
        "brass door key",
        "majestic staircase leading up",
        "majestic staircase leading down",
        "battered book",
        "organ in the corner",
        "open organ in the corner",
        "cabinet on rollers against one wall over",
        "repaired parachute",
        "sign saying 'drop coins for luck'",
    ];

    static #rString = [
        "front porch",
        "Foyer to a large house. Dust is everywhere",
        "Great Hall. Suits of armor line the walls",
        "Breakfast Room. It is bright and cheery",
        "Conservatory. Through a window you see a hedge-maze",
        "Red-Walled Room",
        "Formal Parlor",
        "Green Drawing Room",
        "Trophy Room. Animal heads line the walls",
        "Den",
        "Blue Drawing Room",
        "Library. Empty shelves line the walls",
        "Dining Room",
        "Chinese Room",
        "$",
        "Kitchen. It is bare",
        "Pantry. Dust covers the mahogany shelves",
        "Game Room",
        "Smoking Room. The air is stale in here",
        "Portico. A murky pool glimmers on the south side",
        "Hall Of Mirrors - a good place to reflect",
        "Ballroom. It has a beautiful wood dance floor",
        "Chapel. A tablet says 'Drop a religious item or die!!'",
        "back yard",
        "back yard",
        "Pool Area. There is a large swimming pool here",
        "Pump House. There is pool machinery installed here",
        "middle of the Western Hallway",
        "West Bedroom",
        "Front Balcony. There is a large road below",
        "$",
        "Master Bedroom. There's a huge four-poster bed",
        "Rear Balcony. Below you see a Hedge Maze",
        "East Bedroom",
        "Closet",
        "Junction of the West Hallway and the North-South Hallway",
        "Center of the North-South Hallway",
        "Junction of the East Hallway and the North-South Hallway",
        "Middle of the East Hallway",
        "South end of the East Hallway",
        "hedge maze",
        "hedge maze",
        "hedge maze",
        "hedge maze",
        "hedge maze",
        "hedge maze",
        "walk-in Vault",
        "Dungeon. There is light above and to the south",
        "bottom of the Swimming Pool. A ladder leads up and out"
    ];

    /* #####  End of STATIC DATA  ###### */

    /* ###### Variable Game State Data ###### */

    /** 
     * @type {MiserState}
     */
    static #defaultState = {
        cp: 0,
        em: 1,
        gt: 0,
        du: false,
        pf: true,
        fb: true,
        bf: false,
        fv: false,
        vo: false,
        po: false,
        ch: false,
        ps: false,
        kc: false,
        es: false,
        jm: false,
        gg: false,

        /**
         * Object Pointer array.  
         * pt starts at index 1 in the original program. I'm keeping that here and just setting index 0 to 0.  
         * The index numbers align with the o$ objects array: o$(1)=ripcord, so pt%(1)'s value is an index pointer for the ripcord, into ol% and om$.  
         * A (-1) stored here means the object doesn't have an action for it, such as move, open, etc.  
         * The original 1981 program will crash when looking up ol%(pt%(object_index)) when pt%(object_index) returns -1.  
         * In that case, ol%(-1) produces an ILLEGAL QUANTITY error and the program ends.  
         * Many routines will check that pt%(object_index) isn't equal to a -1 before using it with ol% or om$, but some don't.  
         * For instance, if you try to DROP the CABINET, ORGAN, STAIRS, or any other object that has a -1 in pt%, the program crashes.  
         * (On crash, on the PET or in Vice/XPET on PC: type CONTINUE 14000 and you can resume the game. 14000=start of LOOK routine.)  
         * DYNAMIC DATA.
         * @type {number[]} 
         */
        pt: [
            0,
            17,
            10,
            13,
            1,
            9,
            20,
            -1,
            -1,
            19,
            15,
            23,
            -1,
            -1,
            -1,
            -1,
            -1,
            14,
            -1,
            12,
            11,
            4,
            5,
            -1,
            -1,
            7,
            8,
            -1,
            -1,
            -1,
            -1
        ],

        /**
         * Object Location array.  
         * ol starts at index 1 in the original program. I'm keeping that here and just setting index 0 to 0.  
         * A (-1) stored here means the player is carrying the object. It will be listed by the I or INVEntory command.  
         * A (-2) stored here means the object is hidden.  
         * DYNAMIC DATA.
         * @type {number[]} 
         */
        ol: [
            0,
            26,
            4,
            -2,
            45,
            46,
            -2,
            48,
            39,
            13,
            0,    // Index 10 - Mat location, 0 = rString[0] = front porch
            23,
            28,
            31,
            34,
            6,
            -2,
            -2,
            -2,
            -2,
            -2,  // Index 20 - Brass Door Key, -2 = doesn't exist yet. Will change to 0 (front porch) when the mat is moved
            2,
            27,
            11,
            21,
            -2,
            5,
            -2,
            19
        ],

        // This entire array is being saved in MiserState.
        // Most of this array is static data, but 3 rooms are modified in the original source code.
        // rPercent[5][3] gets modified. (Red-walled room. East becomes 46, to go into vault. )
        // rPercent[8][1] gets modified. (Trophy room. North becomes 17, to go to Game Room. )
        // rPercent[21][3] gets modified. (Ballroom. East becomes 22, to go to Chapel.)
        //
        // I thought someone might want to add additional floors, rooms, or portals that would require
        // updating even more of these arrays, so I'm treating them all as dynamic/changing/must-save for now.
        //
        rPercent: [
            [0, 1, 0, 0, 0],
            [0, 2, 0, 0, 12],
            [0, 3, 1, 0, 0],
            [0, 0, 2, 4, 16],
            [0, 0, 5, 7, 3],
            [0, 4, 6, 0, 0],
            [0, 5, 0, 10, 0],
            [0, 0, 0, 8, 4],
            [0, 0, 9, 0, 7],
            [0, 8, 0, 0, 10],
            [0, 0, 11, 9, 6],
            [0, 10, 0, 0, 0],
            [0, 0, 0, 1, 13],
            [0, 15, 0, 12, 0],
            [0, 0, 0, 0, 0],
            [0, 23, 13, 16, 0],
            [0, 0, 0, 3, 15],
            [0, 0, 8, 0, 18],
            [0, 21, 0, 17, 19],
            [0, 21, 0, 18, 20],
            [0, 21, 21, 19, 19],
            [0, 0, 19, 0, 20],
            [0, 0, 0, 0, 21],
            [0, 24, 15, 40, 25],
            [0, 24, 23, 24, 24],
            [0, 26, 0, 23, 0],
            [0, 0, 25, 0, 0],
            [0, 35, 0, 31, 28],
            [0, 0, 0, 27, 0],
            [0, 39, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 38, 27],
            [0, 0, 36, 0, 0],
            [0, 34, 0, 0, 38],
            [0, 0, 33, 0, 0],
            [0, 0, 27, 36, 0],
            [0, 32, 0, 37, 35],
            [0, 0, 38, 0, 36],
            [0, 37, 39, 33, 31],
            [0, 38, 29, 0, 0],
            [0, 0, 42, 0, 41],
            [0, 44, 42, 0, 0],
            [0, 41, 44, 43, 0],
            [0, 41, 23, 0, 0],
            [0, 0, 42, 0, 45],
            [0, 0, 0, 44, 0],
            [0, 0, 0, 0, 5],
            [0, 0, 40, 0, 0],
            [0, 0, 0, 0, 0]
        ]
    }
    // End of MiserEngine class.
}

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

/**
 * @typedef {Object} MiserResponse
 * @property {string} MiserResponse.text Text that will be displayed to the player.
 * @property {boolean} MiserResponse.isGameOver
 * @property {boolean} MiserResponse.playerDied
 * @property {boolean} MiserResponse.playerEscaped
 * @property {boolean} MiserResponse.isError Error text will be in text property.
 * @property {MiserState} MiserResponse.miserState Game state data that has changed from a new game state.
 */