/**
 * src/scripts/seedFirestore.js
 *
 * One-time script to populate Firestore with all players and clubs.
 *
 * HOW TO RUN (from the goalpedia/ folder):
 *   node src/scripts/seedFirestore.js
 *
 * NOTE: You must fill in your Firebase config values in src/firebase/config.js
 * BEFORE running this script.
 *
 * This script uses the Firebase Admin SDK pattern via the REST API so it
 * can run in Node.js without needing service account credentials.
 * It uses the regular Firebase client SDK instead.
 */

// We use a simple fetch-based approach to write to Firestore REST API
// so this script works in Node.js without any extra setup.

const PLAYERS = [
  { id:"player_01", name:"Heung-Min Son", num:7, flag:"🇰🇷", club:"Tottenham", cid:"spurs", pos:"FW", age:32, nat:"South Korea", cap:true,
    photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Son_Heung-min_2022_%28cropped%29.jpg/440px-Son_Heung-min_2022_%28cropped%29.jpg",
    status:{fit:"100%",fc:"g",last:"May 11 vs Chelsea",next:"May 18 vs Burnley",inj:"None",con:"2026",val:"£28M"},
    s:{g:18,a:9,ap:32,r:7.8,sh:64,ch:47,dr:88,xG:15.3,m:2760,yc:3,rc:0,pa:81},
    at:{g:175,a:121,ap:412,r:7.6,sh:720,ch:445,dr:780,xG:150,m:33100,yc:30,rc:0,pa:79,note:"PL · Bundesliga · K-League · South Korea Intl"},
    perf:{Finishing:87,Dribbling:82,Pace:89,Passing:74,"Aerial Duels":55,Pressing:68},
    m:[{r:"W",o:"Chelsea",d:"May 11",g:2,a:1,rt:9.1},{r:"W",o:"Man Utd",d:"May 4",g:1,a:0,rt:7.4},{r:"D",o:"Arsenal",d:"Apr 27",g:0,a:1,rt:6.9},{r:"L",o:"Liverpool",d:"Apr 20",g:1,a:0,rt:6.3},{r:"W",o:"West Ham",d:"Apr 13",g:2,a:2,rt:9.4}]},
  { id:"player_02", name:"Erling Haaland", num:9, flag:"🇳🇴", club:"Man City", cid:"mancity", pos:"FW", age:24, nat:"Norway", cap:false,
    photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Erling_Haaland_2023_%28cropped%29.jpg/440px-Erling_Haaland_2023_%28cropped%29.jpg",
    status:{fit:"98%",fc:"g",last:"May 10 vs Brighton",next:"May 19 vs Arsenal",inj:"None",con:"2027",val:"£180M"},
    s:{g:24,a:4,ap:30,r:8.1,sh:81,ch:31,dr:42,xG:22.1,m:2590,yc:2,rc:0,pa:74},
    at:{g:280,a:52,ap:324,r:8.0,sh:820,ch:260,dr:310,xG:250,m:26800,yc:22,rc:0,pa:72,note:"PL · Bundesliga · UCL · Norway Intl"},
    perf:{Finishing:95,Dribbling:68,Pace:91,Passing:62,"Aerial Duels":88,Pressing:71},
    m:[{r:"W",o:"Brighton",d:"May 10",g:3,a:0,rt:9.7},{r:"W",o:"Arsenal",d:"May 3",g:1,a:1,rt:8.2},{r:"D",o:"Chelsea",d:"Apr 26",g:0,a:0,rt:6.5},{r:"W",o:"Aston Villa",d:"Apr 19",g:2,a:0,rt:8.8},{r:"W",o:"Burnley",d:"Apr 12",g:1,a:1,rt:7.9}]},
  { id:"player_03", name:"Cole Palmer", num:20, flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿", club:"Chelsea", cid:"chelsea", pos:"MF", age:22, nat:"England", cap:false,
    photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Cole_Palmer_2024_%28cropped%29.jpg/440px-Cole_Palmer_2024_%28cropped%29.jpg",
    status:{fit:"100%",fc:"g",last:"May 11 vs Tottenham",next:"May 18 vs Wolves",inj:"None",con:"2033",val:"£70M"},
    s:{g:20,a:11,ap:34,r:8.0,sh:71,ch:68,dr:104,xG:16.8,m:2940,yc:4,rc:0,pa:85},
    at:{g:22,a:12,ap:37,r:7.9,sh:78,ch:72,dr:115,xG:18,m:3200,yc:5,rc:0,pa:84,note:"PL · FA Cup · England U21"},
    perf:{Finishing:84,Dribbling:86,Pace:77,Passing:85,"Aerial Duels":48,Pressing:72},
    m:[{r:"W",o:"Tottenham",d:"May 11",g:1,a:2,rt:8.9},{r:"W",o:"Man Utd",d:"May 5",g:2,a:0,rt:8.3},{r:"L",o:"Man City",d:"Apr 28",g:0,a:1,rt:7.1},{r:"W",o:"Newcastle",d:"Apr 21",g:1,a:1,rt:8.0},{r:"D",o:"Liverpool",d:"Apr 14",g:1,a:0,rt:7.5}]},
  { id:"player_04", name:"Mohamed Salah", num:11, flag:"🇪🇬", club:"Liverpool", cid:"liverpool", pos:"FW", age:32, nat:"Egypt", cap:false,
    photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Mohamed_Salah_2022_%28cropped%29.jpg/440px-Mohamed_Salah_2022_%28cropped%29.jpg",
    status:{fit:"100%",fc:"g",last:"Apr 20 vs Tottenham",next:"May 18 vs Aston Villa",inj:"None",con:"2025",val:"£55M"},
    s:{g:22,a:13,ap:35,r:8.3,sh:88,ch:74,dr:97,xG:19.2,m:3020,yc:1,rc:0,pa:83},
    at:{g:228,a:97,ap:366,r:7.9,sh:1160,ch:820,dr:960,xG:198,m:30100,yc:19,rc:0,pa:81,note:"PL · UCL · FA Cup · Egypt Intl"},
    perf:{Finishing:91,Dribbling:88,Pace:90,Passing:79,"Aerial Duels":52,Pressing:80},
    m:[{r:"W",o:"Tottenham",d:"Apr 20",g:2,a:1,rt:9.2},{r:"W",o:"Everton",d:"Apr 13",g:1,a:0,rt:7.8},{r:"W",o:"Fulham",d:"Apr 6",g:2,a:2,rt:9.5},{r:"D",o:"Chelsea",d:"Apr 14",g:1,a:0,rt:7.3},{r:"W",o:"Newcastle",d:"Apr 7",g:1,a:1,rt:8.1}]},
  { id:"player_05", name:"Bukayo Saka", num:7, flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿", club:"Arsenal", cid:"arsenal", pos:"FW", age:23, nat:"England", cap:false,
    photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Bukayo_Saka_2023_%28cropped%29.jpg/440px-Bukayo_Saka_2023_%28cropped%29.jpg",
    status:{fit:"95%",fc:"g",last:"May 12 vs Man Utd",next:"May 19 vs Everton",inj:"None",con:"2027",val:"£120M"},
    s:{g:15,a:12,ap:33,r:7.9,sh:62,ch:71,dr:118,xG:13.4,m:2840,yc:3,rc:0,pa:82},
    at:{g:62,a:58,ap:178,r:7.7,sh:310,ch:380,dr:640,xG:56,m:13200,yc:14,rc:0,pa:81,note:"PL · FA Cup · UCL · England Intl"},
    perf:{Finishing:80,Dribbling:90,Pace:88,Passing:82,"Aerial Duels":45,Pressing:85},
    m:[{r:"W",o:"Man Utd",d:"May 12",g:1,a:2,rt:8.7},{r:"D",o:"Tottenham",d:"Apr 27",g:0,a:1,rt:7.2},{r:"W",o:"Wolves",d:"Apr 20",g:2,a:0,rt:8.5},{r:"W",o:"Brighton",d:"Apr 13",g:1,a:1,rt:7.9},{r:"L",o:"Man City",d:"Apr 6",g:0,a:0,rt:6.4}]},
  { id:"player_06", name:"Kevin De Bruyne", num:17, flag:"🇧🇪", club:"Man City", cid:"mancity", pos:"MF", age:33, nat:"Belgium", cap:false,
    photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Kevin_De_Bruyne_2021_%28cropped%29.jpg/440px-Kevin_De_Bruyne_2021_%28cropped%29.jpg",
    status:{fit:"88%",fc:"y",last:"May 10 vs Brighton",next:"May 19 vs Arsenal",inj:"Hamstring (minor)",con:"2025",val:"£40M"},
    s:{g:8,a:12,ap:24,r:7.6,sh:38,ch:92,dr:61,xG:7.1,m:2080,yc:2,rc:0,pa:91},
    at:{g:102,a:178,ap:412,r:7.8,sh:680,ch:1420,dr:720,xG:88,m:33200,yc:38,rc:1,pa:89,note:"PL · Bundesliga · UCL · Belgium Intl"},
    perf:{Finishing:74,Dribbling:79,Pace:72,Passing:96,"Aerial Duels":55,Pressing:62},
    m:[{r:"W",o:"Brighton",d:"May 10",g:0,a:3,rt:9.0},{r:"W",o:"Arsenal",d:"May 3",g:1,a:1,rt:8.1},{r:"D",o:"Chelsea",d:"Apr 26",g:0,a:0,rt:6.8},{r:"W",o:"Aston Villa",d:"Apr 19",g:0,a:2,rt:8.0},{r:"W",o:"Burnley",d:"Apr 12",g:1,a:0,rt:7.5}]},
  { id:"player_07", name:"Cristiano Ronaldo", num:7, flag:"🇵🇹", club:"Al Nassr", cid:"alnassr", pos:"FW", age:39, nat:"Portugal", cap:true,
    photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Cristiano_Ronaldo_2018.jpg/440px-Cristiano_Ronaldo_2018.jpg",
    status:{fit:"96%",fc:"g",last:"May 9 vs Al Hilal",next:"May 16 vs Al Ittihad",inj:"None",con:"2025",val:"£25M"},
    s:{g:35,a:11,ap:38,r:7.9,sh:148,ch:62,dr:88,xG:28.4,m:3240,yc:3,rc:0,pa:76},
    at:{g:919,a:246,ap:1236,r:8.0,sh:4200,ch:1800,dr:2800,xG:740,m:98400,yc:118,rc:11,pa:78,note:"PL · La Liga · Serie A · Saudi · UCL · Portugal Intl"},
    perf:{Finishing:98,Dribbling:86,Pace:87,Passing:76,"Aerial Duels":92,Pressing:74},
    m:[{r:"W",o:"Al Hilal",d:"May 9",g:2,a:1,rt:8.8},{r:"W",o:"Al Fateh",d:"May 2",g:3,a:0,rt:9.2},{r:"W",o:"Al Ahli",d:"Apr 25",g:1,a:2,rt:8.0},{r:"L",o:"Al Ittihad",d:"Apr 18",g:1,a:0,rt:6.8},{r:"W",o:"Al Shabab",d:"Apr 11",g:2,a:1,rt:8.5}]},
  { id:"player_08", name:"Kylian Mbappé", num:9, flag:"🇫🇷", club:"Real Madrid", cid:"realmadrid", pos:"FW", age:25, nat:"France", cap:false,
    photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/2019-07-17_SFC_vs._Paris_Saint-Germain_F.C._850_6552_%28cropped%29.jpg/440px-2019-07-17_SFC_vs._Paris_Saint-Germain_F.C._850_6552_%28cropped%29.jpg",
    status:{fit:"100%",fc:"g",last:"May 11 vs Getafe",next:"May 18 vs Real Betis",inj:"None",con:"2029",val:"£160M"},
    s:{g:29,a:8,ap:35,r:8.2,sh:124,ch:74,dr:132,xG:24.8,m:2980,yc:5,rc:0,pa:80},
    at:{g:346,a:184,ap:462,r:8.1,sh:1480,ch:780,dr:1620,xG:288,m:37800,yc:58,rc:2,pa:80,note:"Ligue 1 · La Liga · UCL · France Intl"},
    perf:{Finishing:93,Dribbling:95,Pace:98,Passing:82,"Aerial Duels":60,Pressing:80},
    m:[{r:"W",o:"Getafe",d:"May 11",g:2,a:1,rt:8.7},{r:"W",o:"Sevilla",d:"May 4",g:1,a:2,rt:8.4},{r:"W",o:"Villarreal",d:"Apr 27",g:3,a:0,rt:9.3},{r:"D",o:"Atletico",d:"Apr 20",g:0,a:1,rt:7.2},{r:"W",o:"Athletic",d:"Apr 13",g:2,a:0,rt:8.1}]},
  { id:"player_09", name:"Lionel Messi", num:10, flag:"🇦🇷", club:"Inter Miami", cid:"intermiami", pos:"FW", age:37, nat:"Argentina", cap:true,
    photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Lionel-Messi-Argentina-2022-FIFA-World-Cup_%28cropped%29.jpg/440px-Lionel-Messi-Argentina-2022-FIFA-World-Cup_%28cropped%29.jpg",
    status:{fit:"92%",fc:"g",last:"May 10 vs CF Montreal",next:"May 17 vs NY Red Bulls",inj:"None",con:"2025",val:"£22M"},
    s:{g:14,a:18,ap:22,r:8.4,sh:68,ch:95,dr:112,xG:11.2,m:1840,yc:2,rc:0,pa:89},
    at:{g:838,a:379,ap:1088,r:8.6,sh:3900,ch:2600,dr:4100,xG:700,m:85400,yc:90,rc:3,pa:87,note:"La Liga · MLS · UCL · World Cup 2022"},
    perf:{Finishing:96,Dribbling:98,Pace:82,Passing:96,"Aerial Duels":48,Pressing:72},
    m:[{r:"W",o:"CF Montreal",d:"May 10",g:1,a:3,rt:9.4},{r:"W",o:"DC United",d:"May 3",g:2,a:1,rt:8.9},{r:"D",o:"Charlotte",d:"Apr 26",g:0,a:2,rt:7.8},{r:"W",o:"NY City",d:"Apr 19",g:1,a:1,rt:8.2},{r:"W",o:"Cincinnati",d:"Apr 12",g:2,a:0,rt:8.6}]},
  { id:"player_10", name:"Vinícius Júnior", num:7, flag:"🇧🇷", club:"Real Madrid", cid:"realmadrid", pos:"FW", age:23, nat:"Brazil", cap:false,
    photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Vinicius_Jr_2023.jpg/440px-Vinicius_Jr_2023.jpg",
    status:{fit:"100%",fc:"g",last:"May 11 vs Getafe",next:"May 18 vs Real Betis",inj:"None",con:"2027",val:"£150M"},
    s:{g:24,a:11,ap:36,r:8.3,sh:108,ch:88,dr:168,xG:20.4,m:3060,yc:7,rc:1,pa:78},
    at:{g:94,a:68,ap:248,r:7.9,sh:620,ch:480,dr:1080,xG:82,m:20400,yc:46,rc:4,pa:76,note:"La Liga · UCL · Brazil Intl"},
    perf:{Finishing:88,Dribbling:96,Pace:97,Passing:78,"Aerial Duels":52,Pressing:76},
    m:[{r:"W",o:"Getafe",d:"May 11",g:1,a:2,rt:8.9},{r:"W",o:"Sevilla",d:"May 4",g:2,a:1,rt:8.6},{r:"W",o:"Villarreal",d:"Apr 27",g:2,a:1,rt:9.0},{r:"D",o:"Atletico",d:"Apr 20",g:0,a:0,rt:7.0},{r:"W",o:"Athletic",d:"Apr 13",g:1,a:1,rt:7.8}]},
  { id:"player_11", name:"Jude Bellingham", num:5, flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿", club:"Real Madrid", cid:"realmadrid", pos:"MF", age:20, nat:"England", cap:false,
    photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Jude_Bellingham_2022_%28cropped%29.jpg/440px-Jude_Bellingham_2022_%28cropped%29.jpg",
    status:{fit:"100%",fc:"g",last:"May 11 vs Getafe",next:"May 18 vs Real Betis",inj:"None",con:"2029",val:"£160M"},
    s:{g:19,a:12,ap:35,r:8.1,sh:74,ch:68,dr:82,xG:14.8,m:2940,yc:6,rc:0,pa:85},
    at:{g:78,a:54,ap:248,r:7.8,sh:380,ch:340,dr:420,xG:62,m:19800,yc:44,rc:1,pa:83,note:"La Liga · Bundesliga · UCL · England Intl"},
    perf:{Finishing:85,Dribbling:86,Pace:84,Passing:88,"Aerial Duels":80,Pressing:88},
    m:[{r:"W",o:"Getafe",d:"May 11",g:1,a:1,rt:8.4},{r:"W",o:"Sevilla",d:"May 4",g:0,a:2,rt:8.0},{r:"W",o:"Villarreal",d:"Apr 27",g:2,a:0,rt:8.8},{r:"D",o:"Atletico",d:"Apr 20",g:1,a:0,rt:7.4},{r:"W",o:"Athletic",d:"Apr 13",g:0,a:1,rt:7.6}]},
  { id:"player_12", name:"T. Alexander-Arnold", num:66, flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿", club:"Liverpool", cid:"liverpool", pos:"DF", age:26, nat:"England", cap:false,
    photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Trent_Alexander-Arnold_2019_%28cropped%29.jpg/440px-Trent_Alexander-Arnold_2019_%28cropped%29.jpg",
    status:{fit:"100%",fc:"g",last:"Apr 20 vs Tottenham",next:"May 18 vs Aston Villa",inj:"None",con:"2025",val:"£70M"},
    s:{g:3,a:10,ap:32,r:7.5,sh:21,ch:83,dr:44,xG:2.8,m:2740,yc:3,rc:0,pa:89},
    at:{g:18,a:70,ap:264,r:7.4,sh:190,ch:620,dr:310,xG:17,m:21800,yc:28,rc:0,pa:88,note:"PL · UCL · FA Cup · England Intl"},
    perf:{Finishing:60,Dribbling:72,Pace:78,Passing:92,"Aerial Duels":62,Pressing:68},
    m:[{r:"W",o:"Tottenham",d:"Apr 20",g:0,a:2,rt:8.4},{r:"W",o:"Everton",d:"Apr 13",g:1,a:0,rt:7.6},{r:"W",o:"Fulham",d:"Apr 6",g:0,a:1,rt:7.9},{r:"D",o:"Chelsea",d:"Apr 14",g:0,a:1,rt:7.2},{r:"W",o:"Newcastle",d:"Apr 7",g:0,a:0,rt:7.0}]},
  { id:"player_13", name:"David Raya", num:22, flag:"🇪🇸", club:"Arsenal", cid:"arsenal", pos:"GK", age:29, nat:"Spain", cap:false,
    photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/David_Raya_2023_%28cropped%29.jpg/440px-David_Raya_2023_%28cropped%29.jpg",
    status:{fit:"100%",fc:"g",last:"May 12 vs Man Utd",next:"May 19 vs Everton",inj:"None",con:"2029",val:"£35M"},
    s:{g:0,a:0,ap:35,r:7.7,sh:0,ch:0,dr:0,xG:0,m:3150,yc:1,rc:0,pa:72},
    at:{g:0,a:0,ap:188,r:7.4,sh:0,ch:0,dr:0,xG:0,m:16200,yc:11,rc:0,pa:70,note:"PL · La Liga · Spain Intl"},
    perf:{Reflexes:88,Positioning:85,Distribution:82,Command:79,"Shot Stopping":90,Claiming:76},
    m:[{r:"W",o:"Man Utd",d:"May 12",g:0,a:0,rt:7.5},{r:"D",o:"Tottenham",d:"Apr 27",g:0,a:0,rt:7.8},{r:"W",o:"Wolves",d:"Apr 20",g:0,a:0,rt:8.0},{r:"W",o:"Brighton",d:"Apr 13",g:0,a:0,rt:7.6},{r:"L",o:"Man City",d:"Apr 6",g:0,a:0,rt:6.9}]},
  { id:"player_14", name:"Robert Lewandowski", num:9, flag:"🇵🇱", club:"FC Barcelona", cid:"barcelona", pos:"FW", age:35, nat:"Poland", cap:true,
    photo:"https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Robert_Lewandowski%2C_FC_Bayern_M%C3%BCnchen_%28by_Sven_Mandel%2C_2019-09-14%29_03.jpg/440px-Robert_Lewandowski%2C_FC_Bayern_M%C3%BCnchen_%28by_Sven_Mandel%2C_2019-09-14%29_03.jpg",
    status:{fit:"100%",fc:"g",last:"May 11 vs Alaves",next:"May 18 vs Villarreal",inj:"None",con:"2026",val:"£22M"},
    s:{g:26,a:8,ap:34,r:7.9,sh:112,ch:44,dr:38,xG:22.8,m:2890,yc:2,rc:0,pa:77},
    at:{g:748,a:210,ap:922,r:8.0,sh:3200,ch:880,dr:640,xG:620,m:72800,yc:82,rc:3,pa:76,note:"La Liga · Bundesliga · UCL · Poland Intl"},
    perf:{Finishing:96,Dribbling:72,Pace:76,Passing:74,"Aerial Duels":90,Pressing:78},
    m:[{r:"W",o:"Alaves",d:"May 11",g:2,a:1,rt:8.4},{r:"W",o:"Real Betis",d:"May 4",g:1,a:0,rt:7.8},{r:"W",o:"Celta Vigo",d:"Apr 27",g:3,a:0,rt:9.0},{r:"D",o:"Getafe",d:"Apr 20",g:0,a:0,rt:6.9},{r:"W",o:"Las Palmas",d:"Apr 13",g:2,a:1,rt:8.3}]},
];

const CLUBS = [
  { id:"arsenal",     name:"Arsenal",       league:"Premier League",   city:"London",     mgr:"Mikel Arteta",     est:1886, trophies:14, logo:"https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Arsenal_FC.svg/180px-Arsenal_FC.svg.png" },
  { id:"mancity",     name:"Man City",      league:"Premier League",   city:"Manchester", mgr:"Pep Guardiola",    est:1880, trophies:22, logo:"https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Manchester_City_FC_badge.svg/180px-Manchester_City_FC_badge.svg.png" },
  { id:"liverpool",   name:"Liverpool",     league:"Premier League",   city:"Liverpool",  mgr:"Arne Slot",        est:1892, trophies:48, logo:"https://upload.wikimedia.org/wikipedia/en/thumb/0/0c/Liverpool_FC.svg/180px-Liverpool_FC.svg.png" },
  { id:"chelsea",     name:"Chelsea",       league:"Premier League",   city:"London",     mgr:"Enzo Maresca",     est:1905, trophies:33, logo:"https://upload.wikimedia.org/wikipedia/en/thumb/c/cc/Chelsea_FC.svg/180px-Chelsea_FC.svg.png" },
  { id:"spurs",       name:"Tottenham",     league:"Premier League",   city:"London",     mgr:"Ange Postecoglou", est:1882, trophies:26, logo:"https://upload.wikimedia.org/wikipedia/en/thumb/b/b4/Tottenham_Hotspur.svg/180px-Tottenham_Hotspur.svg.png" },
  { id:"manu",        name:"Man United",    league:"Premier League",   city:"Manchester", mgr:"Ruben Amorim",     est:1878, trophies:66, logo:"https://upload.wikimedia.org/wikipedia/en/thumb/7/7a/Manchester_United_FC_crest.svg/180px-Manchester_United_FC_crest.svg.png" },
  { id:"realmadrid",  name:"Real Madrid",   league:"La Liga",          city:"Madrid",     mgr:"Carlo Ancelotti",  est:1902, trophies:97, logo:"https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/180px-Real_Madrid_CF.svg.png" },
  { id:"barcelona",   name:"Barcelona",     league:"La Liga",          city:"Barcelona",  mgr:"Hansi Flick",      est:1899, trophies:96, logo:"https://upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_Barcelona_%28crest%29.svg/180px-FC_Barcelona_%28crest%29.svg.png" },
  { id:"bayern",      name:"Bayern Munich", league:"Bundesliga",       city:"Munich",     mgr:"Vincent Kompany",  est:1900, trophies:75, logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282002%E2%80%932017%29.svg/180px-FC_Bayern_M%C3%BCnchen_logo_%282002%E2%80%932017%29.svg.png" },
  { id:"psg",         name:"PSG",           league:"Ligue 1",          city:"Paris",      mgr:"Luis Enrique",     est:1970, trophies:52, logo:"https://upload.wikimedia.org/wikipedia/en/thumb/a/a7/Paris_Saint-Germain_F.C..svg/180px-Paris_Saint-Germain_F.C..svg.png" },
  { id:"alnassr",     name:"Al Nassr",      league:"Saudi Pro League", city:"Riyadh",     mgr:"Stefano Pioli",    est:1955, trophies:9,  logo:"https://upload.wikimedia.org/wikipedia/en/thumb/e/e5/Al_Nassr_FC.svg/180px-Al_Nassr_FC.svg.png" },
  { id:"intermiami",  name:"Inter Miami",   league:"MLS",              city:"Miami",      mgr:"J. Mascherano",    est:2018, trophies:1,  logo:"https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Inter_Miami_CF_shield_-_2023.svg/180px-Inter_Miami_CF_shield_-_2023.svg.png" },
];

// ─── Firestore REST API writer ────────────────────────────────────────────────
// Uses the Firestore REST API so this script runs in plain Node.js without
// needing a service account or firebase-admin SDK.
// You still need to paste your projectId and apiKey below.

const PROJECT_ID = 'YOUR_PROJECT_ID'; // ← replace with your Firebase project ID
const API_KEY    = 'YOUR_API_KEY';    // ← replace with your Firebase API key

async function writeDoc(collection, docId, data) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collection}/${docId}?key=${API_KEY}`;

  // Convert JS object to Firestore value format
  function toFirestoreValue(val) {
    if (val === null || val === undefined) return { nullValue: null };
    if (typeof val === 'boolean') return { booleanValue: val };
    if (typeof val === 'number') return Number.isInteger(val) ? { integerValue: String(val) } : { doubleValue: val };
    if (typeof val === 'string') return { stringValue: val };
    if (Array.isArray(val)) return { arrayValue: { values: val.map(toFirestoreValue) } };
    if (typeof val === 'object') {
      const fields = {};
      for (const [k, v] of Object.entries(val)) fields[k] = toFirestoreValue(v);
      return { mapValue: { fields } };
    }
    return { stringValue: String(val) };
  }

  const fields = {};
  for (const [k, v] of Object.entries(data)) {
    if (k === 'id') continue; // id is the doc path, not a field
    fields[k] = toFirestoreValue(v);
  }

  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to write ${collection}/${docId}: ${err}`);
  }
}

async function seed() {
  if (PROJECT_ID === 'YOUR_PROJECT_ID') {
    console.error('❌ Please replace YOUR_PROJECT_ID and YOUR_API_KEY in this file first!');
    process.exit(1);
  }

  console.log('🌱 Seeding Firestore...');

  console.log('📋 Writing clubs...');
  for (const club of CLUBS) {
    await writeDoc('clubs', club.id, club);
    console.log(`  ✅ ${club.name}`);
  }

  console.log('👤 Writing players...');
  for (const player of PLAYERS) {
    await writeDoc('players', player.id, player);
    console.log(`  ✅ ${player.name}`);
  }

  console.log(`\n🎉 Done! ${CLUBS.length} clubs + ${PLAYERS.length} players written to Firestore.`);
}

seed().catch(err => { console.error('❌ Seed failed:', err.message); process.exit(1); });
