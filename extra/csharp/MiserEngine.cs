using System;
using System.Linq;
using System.Text;

namespace MiserGameCore
{
    public sealed partial class MiserEngine
    {
        private StringBuilder outputText = new StringBuilder(1024);

        public MiserEngine()
        {
            MiserOutputArgs = new MiserOutputArgs { Text = "", IsError = false };
        }

        public MiserOutputArgs Start()
        {
            outputText.Clear();
            return LookCommand();
        }

        /// <summary>
        /// Call this method with user input string.
        /// </summary>
        /// <param name="inputString">User input.</param>
        /// <returns>MiserOutputArgs</returns>
        public MiserOutputArgs ParseInput(string inputString)
        {
            // TODO: Check for null and empty strings first


            // If the inputString is greater than 80 characters, trim it to just 80.
            if (inputString.Length > 80)
            {
                inputString = inputString.Substring(0, 80);
            }

            // Trim leading and trailing white-space
            inputString = inputString.Trim();

            outputText.Clear();

            if (ResumeTarget != ResumeTargetCommand.None)
            {
                switch (ResumeTarget)
                {
                    case ResumeTargetCommand.Score:
                        return ScoreCommand(inputString);
                    case ResumeTargetCommand.Quit:
                        return QuitCommand(inputString);
                }
            }

            char[] delimiter = null;
            var splitString = inputString.Split(delimiter, StringSplitOptions.RemoveEmptyEntries);
            int words = splitString.Count();

            switch (words)
            {
                case 1:
                    // Search the verbs list 
                    int i = GetVerbIndexForString(splitString[0]);
                    if (i > 0)
                    {
                        return Action(i, 0);
                    }
                    else
                    {
                        return ErrorString50000();
                    }
                case 2:
                    i = GetVerbIndexForString(splitString[0]);
                    int j = GetObjectIndexForString(splitString[1]);
                    if (i > 0)
                    {
                        fullObjectString = splitString[1];
                        if (j < 1) j = 0;
                        return Action(i, j);
                    }
                    else
                    {
                        return ErrorString50000();
                    }
                default:
                    return NewOutputArgs("Please type a one or two word command.");
            }
        }

        private MiserOutputArgs Action(int i, int j)
        {
            switch (i)
            {
                case 1:
                case 2:
                    return GetTakeCommand(j);
                case 3:
                case 4:
                case 5:
                    return MoveSlidePushCommand(j);
                case 6:
                    return OpenCommand(j);
                case 7:
                    return ReadCommand(j);
                case 8:
                case 29:
                    return InventoryCommand();
                case 9:
                    return QuitCommand();
                case 10:
                    return DropCommand(j);
                case 11:
                    return SayCommand(j);
                case 12:
                    return PourCommand(j);
                case 13:
                    return FillCommand(j);
                case 14:
                    return UnlockCommand(j);
                case 15:
                    return LookCommand();
                case 16:
                    return GoCommand(j);
                case 17:
                case 18:
                    return NorthCommand();
                case 19:
                case 20:
                    return SouthCommand();
                case 21:
                case 22:
                    return EastCommand();
                case 23:
                case 24:
                    return WestCommand();
                case 25:
                    return ScoreCommand();
                case 26:
                    return TurnCommand(j);
                case 27:
                    return JumpCommand();
                case 28:
                    return SwimCommand();
                // Case 29, INVENTORY, handled above at case 8,29. 
                case 30:
                    return FixCommand(j);
                default:
                    throw new NotImplementedException("In Action method: Verb {i} not implemented.");
            }
        }

        // Case 1 and 2: Get, Take
        private MiserOutputArgs GetTakeCommand(int j)
        {

            if (j == 0)
            {
                return ErrorString50000();
            }

            if (pt[j] == -1) return NewOutputArgs("I am unable to do that.", true);
            if (fna(j) == -1) return NewOutputArgs("You're already carrying it.", true);
            if (fna(j) != cp) return ErrorString51000();
            ol[pt[j]] = -1;
            outputText.Append("Ok");
            // Line 1030
            int x = pt[j];
            if ((x > 3 & x < 9) || x == 19)
            {
                gt = gt + 1;
                outputText.Append("\nYou got a treasure!");
                return NewOutputArgs(outputText.ToString(), false);
            }

            if (j == 2 & ol[20] == -2)   // If getting or taking the MAT, and the key is hidden (-2)
            {
                ol[20] = 0;   // Sets key location to Front Porch
                outputText.Append("\nYou find a door key!");
            }

            return NewOutputArgs(outputText.ToString());

        }

        // Case 3,4,5: Move, Slide, Push
        /// <summary>
        /// <para>MOVE,SLIDE,PUSH verbs.</para>
        /// This method implements the functionality of lines 2000-2210 in the original Miser program.
        /// </summary>
        /// <param name="j">Index into objects[].</param>
        /// <returns>MiserOuputEventArgs</returns>
        private MiserOutputArgs MoveSlidePushCommand(int j)
        {

            if (j == 0)
            {
                // Prints the "What?" or "I don't understand that." messages
                // Lines 210 and 50000 in the original 1981 Miser program
                return ErrorString50000();
            }


            // Check the pt[] array for a -1, which means this object doesn't move.
            // Skip the check for the cabinet pt[13], since it can be moved conditionally. Checked after this in the switch.
            if (j != 13)
            {
                if (pt[j] == -1)
                {
                    return NewOutputArgs("That item stays put.");
                }

                if (ol[pt[j]] != cp & ol[pt[j]] != -1)
                {
                    return ErrorString51000();  // Print "I don't see it here."
                }
            }

            // Only the CABINET, MAT, and RUG can move.

            switch (j)
            {
                // Mat
                case 2:
                    // If brass door key not found/hidden (-2).
                    if (ol[20] == -2)
                    {
                        // Set object location (ol[20]) of key (20) to the front porch (rString[0]).
                        ol[20] = 0;
                        return NewOutputArgs("You find a door key!");
                    }
                    break;
                // Oriental Rug
                case 10:
                    // If trapdoor not found/hidden (-2)
                    if (ol[16] == -2)
                    {
                        // Found trapdoor. Location is now in the Formal Parlor, so it will be observed on a new LOOK command.
                        outputText.Append("You find a trap door!\n\n");
                        ol[16] = 6;
                        return LookCommand();
                    }
                    break;
                // Cabinet
                case 13:
                    // CP=5=Red-Walled Room rString[5]
                    // rPercent(5,3)=0 means EAST direction is unavailable, meaning the vault has not been found yet.
                    // So this means, 'If in Red-Walled Room and EAST direction unavailable, move the cabinet and find the vault'.
                    if (cp == 5 & rPercent[5, 3] == 0)
                    {
                        // FV=Found Vault - Set to true
                        fv = true;
                        outputText.Append("Behind the cabinet is a vault!\n\n");
                        return LookCommand();
                    }
                    else
                    {
                        return NewOutputArgs("That item stays put.");
                    }
            }

            return NewOutputArgs("Moving it reveals nothing.");
        }

        // Case 6: OPEN
        /// <summary>
        /// <para>OPEN verb.</para>
        /// <para>This method implements the functionality of lines 4000-4260 in the original Miser program from 1981.</para>
        /// </summary>
        /// <returns>MiserOutputArgs</returns>
        private MiserOutputArgs OpenCommand(int j)
        {

            // The only objects that have a reaction are:
            // Valve (7), Book (11), Door (12), Cabinet (13), Organ (16), Bag (22), and Vault (27)

            switch (j)
            {
                // Nothing to open
                case 0:
                    return ErrorString50000();
                // Valve
                case 7:
                    return NewOutputArgs("Try turning it.");
                // Book
                case 11:
                    if ((ol[pt[j]] == cp) | (ol[pt[j]] == -1))
                    {
                        return NewOutputArgs("Scrawled in blood on the inside front cover is the message, 'Victory' is a prize-winning word'.");
                    }
                    break;
                // Door
                case 12:
                    switch (cp)
                    {
                        // Front Porch
                        case 0:
                            // Door unlocked?
                            if (du)
                            {
                                return NewOutputArgs("It's already open.");
                            }
                            else
                            {
                                return NewOutputArgs("Sorry, the door is locked.");
                            }
                        // Formal Parlor
                        case 6:
                            outputText.Append("You open the door. You lean over to peer in, and you fall in!\n\n");
                            cp = 47;
                            return LookCommand();
                    }
                    return ErrorString51000();
                // Cabinet
                case 13:
                    // In Red-Walled room? (CP=5)
                    if (ol[26] == cp)
                    {
                        return NewOutputArgs("The cabinet is empty and dusty.\nScribbled in dust on one shelf are the words, 'behind me'.");
                    }
                    else
                    {
                        return ErrorString51000();
                    }
                // Organ
                case 16:
                    // In Ballroom?
                    if (cp == 21)
                    {
                        if (gg)
                        {
                            if (ol[24] != -2)
                            {
                                // Hide the 'ORGAN IN THE CORNER' and reveal the 'OPEN ORGAN IN THE CORNER'
                                ol[24] = -2;
                                ol[25] = 21;
                                // Reveal the Parachute Ripcord
                                ol[17] = 21;
                                // Reveal the Ruby Slippers
                                ol[19] = 21;

                                outputText.Append("As you open it, several objects suddenly appear!\n\n");
                                return LookCommand();
                            }
                            else
                            {
                                return NewOutputArgs("It's already open.");
                            }
                        }
                        else
                        {
                            return NewOutputArgs("It's stuck shut.");
                        }
                    }
                    else
                    {
                        // "I don't see it here."
                        return ErrorString51000();
                    }
                // Bag
                case 22:
                    // If in the vault or carrying it 
                    if ((ol[pt[j]] == cp) | (ol[pt[j]] == -1))
                    {
                        return NewOutputArgs("The bag is knotted securely.\nIt won't open.");
                    }
                    else
                    {
                        return ErrorString51000();
                    }
                // Vault
                case 27:
                    // If in Red-Walled Room and FV=true (found vault)
                    if ((cp == 5) & (fv))
                    {
                        // Vault open?
                        if (vo)
                        {
                            return NewOutputArgs("It's already open.");
                        }
                        else
                        {
                            return NewOutputArgs("I can't, it's locked.");
                        }
                    }
                    else
                    {
                        return ErrorString51000();
                    }
            }

            return NewOutputArgs("I don't know how to open that.");
        }

        // Case 7: READ
        /// <summary>
        /// <para>READ verb.</para>
        /// <para>This method implements the functionality of lines 5000-5050 in the original Miser program from 1981.</para>
        /// </summary>
        /// <param name="j">Index into verbs[] array.</param>
        /// <returns>MiserOutputArgs</returns>
        private MiserOutputArgs ReadCommand(int j)
        {

            // Second word to act on?
            if (j == 0)
            {
                // Returns 'What?' or 'I don't understand'. 
                return ErrorString50000();
            }

            if (pt[j] == -1)
            {
                return NewOutputArgs("There's nothing written on that.");
            }

            if (!ObjectPresent(j))
            {
                // Returns "I don't see it here."
                return ErrorString51000();
            }

            switch (j)
            {
                // PAPER
                case 3:
                    // Player now knows the combination to the vault
                    kc = true;
                    return NewOutputArgs("It says, '12-35-6'.\nhmm.. looks like a combination.");

                // BOOK
                case 11:
                    return NewOutputArgs("The front cover is inscribed in Greek.");

                default:
                    return NewOutputArgs("There's nothing written on that.");
            }
        }

        // Case 8,29: I,INVENTORY
        /// <summary>
        /// <para>INVENTORY verb.</para>
        /// <para>Output a list of all objects the player is carrying.</para>
        /// <para>This method implements the functionality of lines 6000-6040 in the original Miser program from 1981.</para>
        /// </summary>
        /// <returns>MiserOutputArgs</returns>
        private MiserOutputArgs InventoryCommand()
        {

            outputText.Append("You are carrying the following:\n\n");
            int fi = 0;
            bool needNewLine = false;

            for (int x = 1; x < 28; x++)
            {

                // Carrying object omString[x]?  
                if (ol[x] == -1)
                {
                    fi = 1;
                    if (needNewLine)
                    {
                        needNewLine = false;
                        outputText.AppendLine();
                    }
                    outputText.Append($"{omString[x]}");
                    needNewLine = true;
                    // Bucket full?
                    if (x == 1 & bf)
                    {
                        outputText.Append("\n\tThe bucket is full of water.");
                        continue;
                    }
                    if (x == 14)
                    {
                        outputText.Append("\n\t(Better fix it)");
                    }
                }
            }

            // Found items?
            if (fi == 1)
            {
                return NewOutputArgs(outputText.ToString());
            }
            else
            {
                return NewOutputArgs(outputText.Append("Nothing at all.").ToString());
            }
        }

        // Case 9: QUIT
        /// <summary>
        /// <para>QUIT verb.</para>
        /// <para>This method implements the functionality of lines 7000-7150 in the original Miser program from 1981.</para>
        /// </summary>
        /// <returns>MiserOutputArgs</returns>
        private MiserOutputArgs QuitCommand(string ResumeInput = "")
        {
            // Resuming after question?
            if (ResumeTarget == ResumeTargetCommand.Quit)
            {
                ResumeTarget = ResumeTargetCommand.None;
                char answer = ResumeInput.ToLower()[0];
                switch (answer)
                {
                    case 'y':

                        return QuitOrEndGame();
                    default:
                        return NewOutputArgs("Ok\n");
                }
            }


            outputText.Append("Do you really want to quit now?");
            ResumeTarget = ResumeTargetCommand.Quit;
            return NewOutputArgs(outputText.ToString());

        }

        // Case 10: DROP
        private MiserOutputArgs DropCommand(int j)
        {

            // Preservation of bug in original code
            if (pt[j] == -1)
            {

                outputText.Append("?ILLEGAL QUANTITY ERROR IN  8000\n\n");
                outputText.Append("** You have encountered a bug that existed in the original Miser program from 1981. **\n\n");
                outputText.Append("** This bug is being reproduced here to preserve the experience a player would have had playing this game in 1981 on one of the Commodore Pet computers. Except for one thing...the game doesn't just end unexpectedly here as it did before. You get to keep playing as if nothing bad happened!\n\n");
                outputText.Append("*Interesting side note: All the translations of this game that I have seen so far [October 2016] still contain this bug. It's also in the program listings reprinted in several books and magazines. -Kristina");
                return NewOutputArgs(outputText.ToString());
            }

            // Carrying this object?
            if (ol[pt[j]] != -1)
            {
                return NewOutputArgs("You aren't carrying it!");
            }

            // Ok, player is carrying the object represented by pt[j], since ol[pt[j]] has a value of -1 here.
            // The only objects that DROP should provide a special response for are the 5 treasures, the Penny, and the Cross.
            // All other objects just get dropped with an 'Ok' response.

            // Check for one of the 5 treasures
            switch (pt[j])
            {
                // One of the 5 treasures
                // Remember that the value of pt[j] is an index into the omString[] array (om$() in original program).
                case 4:
                case 5:
                case 7:
                case 8:
                case 19:
                    return NewOutputArgs("Don't drop *treasures*!");
            }

            // Check for a Penny or a Cross specifically. All other objects should just be dropped with a response of "Ok"
            switch (j)
            {
                // Penny
                case 19:
                    // In Portico?
                    if (cp == 19)
                    {
                        // The Penny is being carried, and the player is in the Portico.
                        // DROP PENNY action

                        // Update the EAST (3) direction of the BALLROOM (21) to point toward the CHAPEL (22)
                        // Player can now move from the BALLROOM to the CHAPEL. 
                        rPercent[21, 3] = 22;
                        // Update object location of the PENNY to 'hidden'(-2)
                        ol[12] = -2;
                        return NewOutputArgs("As the penny sinks below the surface of the pool, a fleeting image of a chapel with dancers outside appears.");
                    }
                    break;
                // Cross
                case 20:
                    // In Chapel?
                    if (cp == 22)
                    {
                        // The CROSS is being carried, and the player is in the PORTICO.
                        // DROP CROSS action
                        // LINES 8200-8221 in the original program.

                        // Still trying to figure out what GG could stand for.
                        // If GG is TRUE it means the player can OPEN the ORGAN in the BALLROOM.
                        // Prior to dropping the CROSS here, this wasn't possible.
                        // GG = 'Got God'? You know...chapel...cross...God...
                        gg = true;
                        // RUSTY CROSS becomes 'hidden' (-2) 
                        ol[11] = -2;
                        // Change room description from "chapel. A tablet says 'drop a religious item or die!!' to
                        // simply "chapel", because the tablet disintegrates now.
                        rString[22] = "chapel";
                        // "organ in the corner" becomes "closed organ playing music in the corner"
                        omString[24] = "closed organ playing music in the corner";
                        return NewOutputArgs("Even before it hits the ground, the cross fades away!\n\nThe tablet has disintegrated.\n\nYou hear music from the organ.");
                    }
                    break;
            }

            // If the PENNY or the CROSS weren't in their special action locations in the above switch statement, they will be dropped here.
            // Any other objects being carried will be dropped here as well.
            // ol[pt[j]] (object location) gets updated to the current position. (CP) 
            ol[pt[j]] = cp;
            return NewOutputArgs("Ok");
        }

        // Case 11: SAY
        private MiserOutputArgs SayCommand(int j)
        {
            switch (j)
            {
                // No second word to say
                case 0:
                    return NewOutputArgs("Say what???");
                // Lines 9100-9120 Say ritnew
                case 14:
                    // In Pantry?
                    if (cp == 4)
                    {
                        // Charmed Snake?
                        if (ch)
                        {
                            return NewOutputArgs("Nothing happens.");
                        }
                        else
                        {
                            ch = true;
                            // Vicious snake disappears from conservatory.
                            ol[2] = -2;
                            // Charmed Snake appears in conservatory. (rString[4])
                            ol[3] = 4;
                            return NewOutputArgs("The snake is charmed by the very utterance of your words.");
                        }
                    }
                    else
                    {
                        return NewOutputArgs("Nothing happens.");
                    }
                // Lines 9200-9220 Say victory
                case 15:
                    // In Trophy room?
                    if (cp == 8)
                    {
                        // Portal open?
                        if (po)
                        {
                            return NewOutputArgs("Nothing happens.");
                        }
                        else
                        {
                            // Set Portal Open
                            po = true;
                            // Set Trophy Room north direction to point toward rString[17], which is the Game Room.
                            rPercent[8, 1] = 17;
                            // 'Portal in the North Wall' appears in the Trophy Room (rString[8]).
                            ol[18] = 8;
                            return NewOutputArgs("A portal has opened in the north wall!!");
                        }
                    }
                    else
                    {
                        return NewOutputArgs("Nothing happens.");
                    }
                // Line 9300 Say Xyzzy, Say Plugh (These are magic words used in the 'Colossal Cave Adventure' game from 1975!)
                case 29:
                case 30:
                    return NewOutputArgs("A hollow voice says, 'Wrong adventure'.");
                default:
                    return NewOutputArgs($"Okay, '{fullObjectString}'.\nNothing happens.");
            }

        }

        // Case 12: POUR
        private MiserOutputArgs PourCommand(int j)
        {
            // Only the bucket (oString[4]) can be poured.
            if (j != 4)
            {
                return NewOutputArgs("I wouldn't know how.");
            }

            if (!ObjectPresent(j))
            {
                return ErrorString51000();
            }

            // Is bucket empty?
            if (!bf)
            {
                return NewOutputArgs("The bucket is already empty.");
            }

            switch (cp)
            {
                // BLUE DRAWING ROOM
                case 10:
                    // Is fire burning?
                    if (fb)
                    {
                        // Fire Burning becomes FALSE. The fire is out now.
                        fb = false;
                        // Bucket is no longer full.
                        bf = false;


                        outputText.Append("Congratulations! You have vanquished the flames.\n\n");
                        return LookCommand();
                    }
                    break;
                // PORTICO
                case 19:
                    return NewOutputArgs("Ok");
                    // 
            }
            return NewOutputArgs("The water disappears quickly.");
        }

        // Case 13: FILL
        private MiserOutputArgs FillCommand(int j)
        {
            if (j == 0)
            {
                // "What?" or "I don't understand."
                return ErrorString50000();
            }

            if (pt[j] == -1)
            {
                return NewOutputArgs("That wouldn't hold anything.");
            }


            if (!ObjectPresent(j))
            {
                // "I don't see it here."
                return ErrorString51000();
            }

            // Is this the bucket?
            if (j == 4)
            {
                // Is the bucket full?
                if (bf)
                {
                    return NewOutputArgs("It's already full.");
                }
                switch (cp)
                {

                    // Bucket can ony be filled in the PORTICO and BACK YARD near the faucet.
                    case 19:
                    case 23:
                        bf = true;
                        return NewOutputArgs("Your bucket is now full.");
                    // POOL AREA
                    case 25:
                        if (pf)
                        {
                            return NewOutputArgs("I'd rather stay away from the mercury.");
                        }
                        break;
                }
                return NewOutputArgs("I don't see any water here.");
            }
            else
            {
                // Only the bucket can be filled
                return NewOutputArgs("That wouldn't hold anything.");
            }
        }

        // Case 14: UNLOCK
        /// <summary>
        /// Only the DOOR, TRAPDOOR, and VAULT are acted on here.
        /// </summary>
        /// <param name="j">Index into objects[].</param>
        private MiserOutputArgs UnlockCommand(int j)
        {
            // Only the DOOR/TRAPDOOR (12) and the VAULT (27) can be unlocked
            switch (j)
            {
                // No object
                case 0:
                    // Return "What?" or "I don't understand."
                    return ErrorString50000();
                // Door or Trapdoor
                case 12:
                    switch (cp)
                    {
                        // Door at Front Porch (CP=0)
                        case 0:
                            if (du)
                            {
                                return NewOutputArgs("It's already unlocked.");
                            }
                            // Carrying the key? (omString[20])
                            if (ol[20] != -1)
                            {
                                return NewOutputArgs("I need a key.");
                            }
                            else
                            {
                                du = true;

                                outputText.Append("The door easily unlocks and swings open.\n\n");
                                return LookCommand();
                            }
                        // Trapdoor in Formal Parlor (CP=6) 
                        case 6:
                            // Trapdoor Hidden? 
                            if (ol[16] != -2)
                            {
                                return NewOutputArgs("The trapdoor has no lock.");
                            }
                            else
                            {

                                return NewOutputArgs("I don't see it here.");
                            }
                        default:
                            // "I don't see it here."
                            return ErrorString51000();
                    }
                // Vault
                case 27:
                    // In Red-Walled Room?
                    if (cp == 5)
                    {
                        // Vault open?
                        if (vo)
                        {
                            return NewOutputArgs("It's already open.");
                        }
                        // Found vault?
                        if (fv)
                        {
                            // Know combination?
                            if (kc)
                            {
                                vo = true;
                                rPercent[5, 3] = 46;

                                outputText.Append("Ok, let's see. 12..35..6..\n<CLICK!> The door swings open.");
                                return LookCommand();

                            }
                            else
                            {
                                return NewOutputArgs("I don't know the combination.");
                            }
                        }
                        else
                        {
                            return ErrorString51000();
                        }
                    }
                    else
                    {
                        // "I don't see it here."
                        return ErrorString51000();
                    }
                default:
                    return NewOutputArgs("I wouldn't know how to unlock one.");
            }

        }

        // Case 15: LOOK
        /// <summary>
        /// <para>LOOK verb.</para>
        /// <para>This method implements the functionality of lines 14000-14170 in the original Miser program.</para>
        /// </summary>
        /// <returns>MiserOuputEventArgs</returns>
        private MiserOutputArgs LookCommand()
        {
            // Line 14000 - Print current position
            outputText.Append($"You are in the {rString[cp]}.");      // Line 14000

            // Lines 14010-14030 Print list of all objects at this location (CP variable)
            for (int x = 1; x < 29; x++)
            {
                if (ol[x] == cp)
                {
                    // Object at this location (CP)
                    outputText.Append($"\n\nThere is a {omString[x]} here.");
                    if ((x == 1) & bf)  // If the plastic bucket is here and it is full (BF=true)
                    {
                        outputText.Append(" The bucket is full of water.");
                    }
                }
            }

            // Special actions depending on current position (CP)

            switch (cp)
            {
                // Line 14127 Front Porch
                case 0:
                    // Door unlocked?
                    if (du) outputText.Append("\n\nAn open door leads north.");
                    break;
                // Lines 14125-14126 Red-Walled Room
                case 5:
                    // Found vault?
                    if (fv) outputText.Append("\n\nThere is a vault in the east wall.");
                    if (vo) outputText.Append("\nThe vault is open.");
                    break;
                // Lines 14060-14080 and 14120 Blue Drawing Room
                case 10:
                    // Fire Burning
                    if (fb)
                    {
                        outputText.Append("\n\nThere is a hot fire on the south wall!\nIf I go that way I'll burn to death!");
                    }
                    else
                    {
                        outputText.Append("\n\nThere is evidence of a recent fire here.");
                    }
                    break;
                // Lines 14090-14105 Pantry
                case 16:
                    outputText.Append("\n\nA rich, full voice says, 'Ritnew is a charming word'.");
                    break;
                // Line 14115 Back Yard
                case 23:
                    outputText.Append("\n\nThere is a leaky faucet nearby.");
                    break;
                // Lines 14040-14056 Pool Area
                case 25:
                    // Pool full?
                    if (pf)
                    {
                        outputText.Append("\n\nThe pool is full of liquid mercury!");
                    }
                    else
                    {
                        outputText.Append("\n\nThe pool's empty.");
                        if (ol[7] == 48)
                        {
                            outputText.Append("\n\nI see something shiny in the pool!");
                        }
                    }
                    break;
                // Line 14110 Pump House
                case 26:
                    outputText.Append("\n\nThere is a valve on one of the pipes.");
                    break;
                // Line 14130 Bottom of Swimming Pool
                case 48:
                    return NewOutputArgs(outputText.ToString(), false);
            }

            // Lines 14130-14170
            // Print all available direction commands from this location.
            outputText.Append("\n\nObvious Exits:\n");
            if (rPercent[cp, 1] > 0) outputText.Append("N ");
            if (rPercent[cp, 2] > 0) outputText.Append("S ");
            if (rPercent[cp, 3] > 0) outputText.Append("E ");
            if (rPercent[cp, 4] > 0) outputText.Append("W ");

            return NewOutputArgs(outputText.ToString(), false);

        }

        // Case 16: GO
        private MiserOutputArgs GoCommand(int j)
        {
            // Valid objects are Ladder(8), Stairs(18), and Pool(28).
            switch (j)
            {
                // Ladder
                case 8:
                    // In bottom of pool?
                    if (cp == 48)
                    {
                        // Move from 'bottom of swimming pool' to 'Pool Area'
                        cp = 25;

                        return LookCommand();
                    }
                    else
                    {
                        // Print "I don't see it here."
                        return ErrorString51000();
                    }
                // Stairs
                case 18:
                    // In 'Great Hall' or 'Middle of the western hallway'?
                    switch (cp)
                    {
                        // Great Hall.
                        case 2:
                            // Carrying sword?
                            if (ol[9] == -1)
                            {
                                // Move from Great Hall to 'Middle of the western hallway'
                                cp = 27;

                                outputText.Append("The suits of armor try to stop you, but you fight them off with your sword.\n\n");
                                return LookCommand();
                            }
                            else
                            {
                                return NewOutputArgs("The suits of armor prevent you from going up!");
                            }

                        // Middle of the western hallway.
                        case 27:
                            // Move to Great Hall
                            cp = 2;
                            return LookCommand();
                        default:
                            // Print "I don't see it here."
                            return ErrorString51000();
                    }
                // Pool
                case 28:
                    // Pool full?
                    if (pf)
                    {
                        return NewOutputArgs("The pool is full of mercury!");
                    }
                    else
                    {
                        // Move to bottom of swimming pool
                        cp = 48;

                        return LookCommand();
                    }

                default:
                    return ErrorString50000();
            }
        }

        // Case 17,18: NORTH, N
        private MiserOutputArgs NorthCommand()
        {


            if (cp == 0 & !du)
            {
                outputText.Append("The door is locked shut.");
                return NewOutputArgs(outputText.ToString());
            }

            if (rPercent[cp, 1] == 0) return ErrorString52000();

            if (cp == 0) outputText.Append("The door slams shut behind you!\n\n");

            cp = rPercent[cp, 1];
            return LookCommand();

        }

        // Case 19,20: SOUTH, S
        private MiserOutputArgs SouthCommand()
        {
            if (cp == 10 & fb)
            {
                outputText.Append("You have burnt to a crisp!");

                return NewOutputArgs(outputText.ToString(), end: true);
            }

            MiserOutputArgs snakeAction = CheckSnake();
            if (snakeAction != null)
            {
                return snakeAction;
            }

            if (rPercent[cp, 2] == 0) return ErrorString52000();
            cp = rPercent[cp, 2];

            return LookCommand();
        }

        // Case 21,22: EAST, E
        private MiserOutputArgs EastCommand()
        {
            MiserOutputArgs snakeAction = CheckSnake();
            if (snakeAction != null)
            {
                return snakeAction;
            }

            if (rPercent[cp, 3] == 0) return ErrorString52000();
            cp = rPercent[cp, 3];

            return LookCommand();

        }

        // Case 23,24: WEST, W
        private MiserOutputArgs WestCommand()
        {
            if (rPercent[cp, 4] == 0) return ErrorString52000();

            cp = rPercent[cp, 4];
            return LookCommand();
        }

        // Case 25: SCORE
        private MiserOutputArgs ScoreCommand(string ResumeInput = "")
        {
            // Resuming after question?
            if (ResumeTarget == ResumeTargetCommand.Score)
            {
                ResumeTarget = ResumeTargetCommand.None;
                char answer = ResumeInput.ToLower()[0];
                switch (answer)
                {
                    case 'y':

                        return QuitOrEndGame();
                    case 'n':
                        return NewOutputArgs("Ok\n");
                    default:
                        ResumeTarget = ResumeTargetCommand.Score;
                        return NewOutputArgs("Please answer Yes or No");
                }
            }

            outputText.Append($"If you were to quit now, you would have a score of: {gt * 20} points.\n(100 possible)\n\n");
            outputText.Append("Do you indeed wish to quit now?");
            ResumeTarget = ResumeTargetCommand.Score;
            return NewOutputArgs(outputText.ToString());
        }

        // Case 26: TURN
        /// <summary>
        /// Only the VALVE can be turned.
        /// </summary>
        /// <param name="j">Index into objects[].</param>
        private MiserOutputArgs TurnCommand(int j)
        {
            if (j != 7)
            {
                return NewOutputArgs("I don't know how to turn such a thing.");
            }

            if (cp != 26)
            {
                return ErrorString51000();
            }

            // Toggle POOL FULL
            pf = !pf;
            return NewOutputArgs("With much effort, you turn the valve 5 times. You hear the sound of liquid\nflowing through the pipes.");
        }

        // Case 27: JUMP
        /// <summary>
        /// Can only JUMP from MIDDLE OF THE WESTERN HALLWAY, FRONT BALCONY, and REAR BALCONY.
        /// </summary>
        private MiserOutputArgs JumpCommand()
        {

            bool signalGameEnd = false;

            switch (cp)
            {
                case 27:
                    // MIDDLE OF THE WESTERN HALLWAY
                    outputText.Append("You jump...\n");
                    if (jm)
                    {
                        outputText.Append("Now you've done it. You ignored\nmy warning, and as a result\nyou have broken your neck!\n\nYou are dead.");
                        signalGameEnd = true;
                    }
                    else
                    {
                        jm = true;
                        cp = 2;
                        outputText.Append("You have landed down-stairs,\nand narrowly escaped serious\ninjury. Please don't try it again.\n\n");
                        LookCommand();
                    }
                    break;
                case 29:
                case 32:
                    outputText.Append("You jump...\n");

                    // Next action depends on the three possible states of the parachute in the players inventory:
                    //      1) No parachute. Not in inventory.
                    //      2) Carrying the parachute that hasn't been fixed with the ripcord.
                    //      3) Carrying a fully functional parachute.


                    if (ol[14] == -1)
                    {
                        // Have Parachute with no ripcord
                        outputText.Append("There is no way to open the parachute!\n");
                        outputText.Append("You hit the ground.\n");
                        outputText.Append("You have broken your neck!\n\n");
                        outputText.Append("You are dead.");
                        signalGameEnd = true;
                        break;

                    }
                    else if (ol[27] == -1)
                    {
                        // Have fully functional parachute
                        outputText.Append("You yank the ripcord and the\n'chute comes billowing out.");
                        if (cp == 32)
                        {
                            // At rear balcony, so change current position to HEDGE MAZE (40)
                            cp = 40;
                            outputText.Append("\n\n");
                            outputText.Append(LookCommand().Text);
                            break;
                        }
                        else
                        if (cp == 29)
                        {
                            outputText.Append("\nYou land safely.\n\nCongratulations on escaping!\n\n");
                            es = true;
                            outputText.Append(QuitOrEndGame().Text);
                            signalGameEnd = true;
                            break;
                        }
                    }
                    else
                    {
                        outputText.Append("You hit the ground.\n");
                        outputText.Append("You have broken your neck!\n\n");
                        outputText.Append("You are dead.");
                        signalGameEnd = true;
                        break;
                    }

                    break;

                default:
                    outputText.Append("There's nowhere to jump.");
                    break;
            }

            return NewOutputArgs(outputText.ToString(), end: signalGameEnd);
        }


        // Case 28: SWIM
        private MiserOutputArgs SwimCommand()
        {
            switch (cp)
            {
                // Portico
                case 19:
                    return NewOutputArgs("The water is only a few inches deep.");
                // Pool area
                case 25:
                    // Pool full?
                    if (pf)
                    {
                        return NewOutputArgs("In mercury? No way!");
                    }
                    else
                    {
                        return NewOutputArgs("The pool is empty.");
                    }
                default:
                    return NewOutputArgs("There's nothing here to swim in!");
            }
        }

        // Case 29: INVENTORY -> Handled at Case 8 above (Case 8,29:)

        // Case 30: FIX
        private MiserOutputArgs FixCommand(int j)
        {
            switch (j)
            {
                // Nothing to fix
                case 0:
                    return ErrorString50000();
                // Valve
                case 7:
                    return NewOutputArgs("I ain't no plumber.");
                case 17:
                    // If parachute with no ripcord isn't at current position AND not carrying it
                    if (!ObjectPresent(j))
                    {
                        // Print "I don't see it here."
                        return ErrorString51000();
                    }

                    if (ol[14] == -2)
                    {
                        return NewOutputArgs("It's already fixed.");
                    }

                    // If not carrying the ripcord
                    if (ol[17] != -1)
                    {
                        return NewOutputArgs("I need a ripcord.");
                    }

                    // Parachute with no ripcord and ripcord is here, so fix the parachute.
                    // Reveal 'repaired parachute' at the same location as 'parachute with no ripcord'
                    ol[27] = ol[14];
                    // Hide 'parachute with no ripcord'
                    ol[14] = -2;
                    // Update pointer to omString[27] 'repaired parachute'
                    pt[17] = 27;
                    // Update parachute ripcord location to the front porch. Weird, but it works to hide it.
                    ol[17] = 0;
                    return NewOutputArgs("I'm no expert, but I think it'll work.");
                default:
                    return NewOutputArgs("I wouldn't know how.");
            }
        }

        private MiserOutputArgs CheckSnake()
        {
            if (cp == 4 & !ch)
            {
                if (!ps)
                {
                    ps = true;
                    return NewOutputArgs("The snake is about to attack!");
                }
                else
                {
                    return NewOutputArgs("The snake bites you!\nYou are dead.", end: true);
                }
            }
            else
            {
                return null;
            }
        }

        private MiserOutputArgs QuitOrEndGame()
        {
            outputText.Append($"You accumulated {gt} treasures, \n for a score of {gt * 20} points.\n(100 Possible)");
            if (es)
            {
                gt++;
            }
            else
            {
                outputText.Append("\n\nHowever, you did not escape.");
            }

            outputText.Append($"\n\nThis puts you in a class of:\n{rank[gt]}");

            if (gt != 6)
            {
                outputText.Append("\n\nBetter luck next time!");
            }

            return NewOutputArgs(outputText.ToString(), end: true);
        }

        /// <summary>
        /// Creates new output arguments.
        /// </summary>
        /// <param name="s">String to return.</param>
        /// <param name="error">Signal an error to the host program.</param>
        /// <param name="end">Signal to end the game.</param>
        /// <returns>MiserOutputArgs</returns>
        private MiserOutputArgs NewOutputArgs(string s, bool error = false, bool end = false)
        {
            MiserOutputArgs.Reset();
            MiserOutputArgs.Text = s;
            MiserOutputArgs.IsError = error;
            MiserOutputArgs.End = end;
            return MiserOutputArgs;
        }

        private int GetVerbIndexForString(string s)
        {
            if (s.Length > 4)
            {
                s = s.ToLower().Substring(0, 4);
            }
            else
            {
                s = s.ToLower();
            }

            for (int x = 1; x < 31; x++)
            {
                if (s.Equals(verbs[x]))
                {
                    // Match
                    return x;
                }
            }

            return -1;
        }

        private int GetObjectIndexForString(string s)
        {
            if (s.Length > 4)
            {
                s = s.ToLower().Substring(0, 4);
            }
            else
            {
                s = s.ToLower();
            }

            for (int x = 1; x < 31; x++)
            {
                if (s.Equals(objects[x]))
                {
                    // Match
                    return x;
                }
            }
            return -1;
        }

        /// <summary>
        /// Returns one of "What?" or "I don't understand."
        /// </summary>
        private MiserOutputArgs ErrorString50000()
        {
            MiserOutputArgs.Reset();
            outputText.Append($"{hString[em]}");
            MiserOutputArgs.Text = outputText.ToString();
            MiserOutputArgs.IsError = false;
            em = 3 - em;
            return MiserOutputArgs;
        }

        /// <summary>
        /// Returns "I don't see it here."
        /// </summary>
        private MiserOutputArgs ErrorString51000()
        {
            MiserOutputArgs.Reset();
            outputText.Append("I don't see it here.");
            MiserOutputArgs.Text = outputText.ToString();
            MiserOutputArgs.IsError = false;
            return MiserOutputArgs;
        }

        /// <summary>
        /// Returns "It's impossible to go that way."
        /// </summary>
        private MiserOutputArgs ErrorString52000()
        {
            MiserOutputArgs.Reset();
            outputText.Append("It's impossible to go that way.");
            MiserOutputArgs.Text = outputText.ToString();
            MiserOutputArgs.IsError = false;
            return MiserOutputArgs;
        }

        private bool ObjectPresent(int j)
        {
            // If object is at current position or being carried, it is present.
            if ((fna(j) == cp) || (fna(j) == -1))
            {
                return true;
            }
            else
            {
                return false;
            }
        }

        /// <summary>
        /// Returns an object location value for the object typed after the verb on an input line
        /// </summary>
        private int fna(int x)
        {
            return ol[pt[x]];
        }
    }
}
