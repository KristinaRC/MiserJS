using System;
using System.Collections.Generic;
using System.Text;

namespace MiserGameCore
{
    public sealed partial class MiserEngine
    {
        enum ResumeTargetCommand { None, Score, Quit };

        string[] verbs = {
            "",             // v$ (verbs) begins at 1 in the original program. Setting index 0 to "" here.
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
        };

        string[] objects = {
            "",             // o$ (objects) begins at 1 in the original program. Setting index 0 to "" here.
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
        };

        readonly string[] hString = {
            "",
            "What?",
            "I don't understand that."
        };

        // Rank descriptions
        readonly string[] rank =
        {
            "<Beginner Adventurer>",
            "<Amateur Adventurer>",
            "<Journeyman Adventurer>",
            "<Experienced Adventurer>",
            "<Pro Adventurer>",
            "<Master Adventurer>",
            "<Grandmaster Adventurer>"
        };
    }
}
