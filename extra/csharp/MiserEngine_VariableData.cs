namespace MiserGameCore
{
    public sealed partial class MiserEngine
    {
       
        string fullObjectString;
        MiserOutputArgs MiserOutputArgs;
        ResumeTargetCommand ResumeTarget = ResumeTargetCommand.None;

        /// <summary>
        /// Current Position
        /// </summary>
        int cp = 0;
        /// <summary>
        /// Error Message
        /// </summary>
        int em = 1;
        /// <summary>
        /// Got Treasure
        /// </summary>
        int gt = 0;
        /// <summary>
        /// Door Unlocked
        /// </summary>
        bool du = false;
        /// <summary>
        /// Pool Full
        /// </summary>
        bool pf = true;
        /// <summary>
        /// Fire Burning
        /// </summary>
        bool fb = true;
        /// <summary>
        /// Bucket Full
        /// </summary>
        bool bf = false;
        /// <summary>
        /// Found Vault
        /// </summary>
        bool fv = false;
        /// <summary>
        /// Vault Open
        /// </summary>
        bool vo = false;
        /// <summary>
        /// Portal Open
        /// </summary>
        bool po = false;
        /// <summary>
        /// Charmed Snake
        /// </summary>
        bool ch = false;
        /// <summary>
        /// Peeved Snake
        /// </summary>
        bool ps = false;
        /// <summary>
        /// Know Combination
        /// </summary>
        bool kc = false;
        /// <summary>
        /// Escaped
        /// </summary>
        bool es = false;
        /// <summary>
        /// Jump Made
        /// </summary>
        bool jm = false;
        /// <summary>
        /// Got God? I mean, it is related to the 'drop a religious item or die' and the cross...
        /// </summary>
        bool gg = false;

        // Room Map - N S E W
        int[,] rPercent = new int[49, 5] {
            { 0,1,0,0,0 },
            { 0,2,0,0,12 },
            { 0,3,1,0,0 },
            { 0,0,2,4,16 },
            { 0,0,5,7,3 },
            { 0,4,6,0,0 },
            { 0,5,0,10,0 },
            { 0,0,0,8,4 },
            { 0,0,9,0,7 },
            { 0,8,0,0,10 },
            { 0,0,11,9,6 },
            { 0,10,0,0,0 },
            { 0,0,0,1,13 },
            { 0,15,0,12,0 },
            { 0,0,0,0,0 },
            { 0,23,13,16,0 },
            { 0,0,0,3,15 },
            { 0,0,8,0,18 },
            { 0,21,0,17,19 },
            { 0,21,0,18,20 },
            { 0,21,21,19,19 },
            { 0,0,19,0,20 },
            { 0,0,0,0,21 },
            { 0,24,15,40,25 },
            { 0,24,23,24,24 },
            { 0,26,0,23,0 },
            { 0,0,25,0,0 },
            { 0,35,0,31,28 },
            { 0,0,0,27,0 },
            { 0,39,0,0,0 },
            { 0,0,0,0,0 },
            { 0,0,0,38,27 },
            { 0,0,36,0,0 },
            { 0,34,0,0,38 },
            { 0,0,33,0,0 },
            { 0,0,27,36,0 },
            { 0,32,0,37,35 },
            { 0,0,38,0,36 },
            { 0,37,39,33,31 },
            { 0,38,29,0,0 },
            { 0,0,42,0,41 },
            { 0,44,42,0,0 },
            { 0,41,44,43,0 },
            { 0,41,23,0,0 },
            { 0,0,42,0,45 },
            { 0,0,0,44,0 },
            { 0,0,0,0,5 },
            { 0,0,40,0,0 },
            { 0,0,0,0,0 } };


        /// <summary>
        /// Object Location array.
        /// <para>A (-1) stored here means the player is carrying the object. It will be listed by the I or INVEntory command.</para>
        /// <para>A (-2) stored here means the object is hidden.</para>
        /// </summary>
        readonly int[] ol =
       {   0,    // ol starts at index 1 in the original program. I'm keeping that here and just setting index 0 to 0.
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
        };

        /// <summary>
        /// Room and place descriptions.
        /// </summary>
        readonly string[] rString = {
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
        };

        string[] omString = {
            "",     // om$ begins at 1 in the original program. Setting index 0 to "" here.
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
            "sign saying 'drop coins for luck'"
        };

       

        int[] pt =
        {    0,    // pt starts at index 1 in the original program. I'm keeping that here and just setting index 0 to 0.
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
        };
    }
}
