//CRUD app for storing songs.

//Establish a port number
const listenPort = 80;

//Require express (bring express into the program)
let express = require('express');

//Make an object of type express
let app = express();

//Prevents errors with url and extends max number of characters
app.use(express.urlencoded({extended: true}));

//Set the view engine as ejs
app.set('view engine', 'ejs');

//listen to activity on routes
app.listen(listenPort, () => {
    console.log("Listening on " + listenPort);
});

//Require knex so we can implement our database
let knex = require("knex")({
    client: "sqlite3",
    connection: {
        filename: "./musiclibrary.db"
    },
    useNullAsDefault: true
});

/********** routes ***********/

//Load our root page, populated with our database
app.get("/", (req, res) => {
    knex.from("Songs").select("*").orderBy("title")
    .then (songs => {
        console.log("Songs: " + songs.length);
        res.render("index", {songList: songs});
    }).catch(err => {
        console.log(err);
        res.status(500).json({err});
    });
});

//Load our add song page
app.get('/addSong', (req, res) => {
    res.render('addsong');
});

//Update our database on the addsong page
app.post('/addSong', (req, res) => {
    knex('Songs').insert(req.body).then(song => {
        res.redirect('/');
    })
});

//Load our edit song page, calling the specific id we want
app.get('/editSong/:id', (req, res) => {
    knex('Songs').where('id', req.params.id)
        .then(results => {
            res.render("editsong", {song: results});
        }).catch(err => {
            console.log(err);
            res.status(500).json({err});
        });
});

//Update our database based on the changes made
app.post('/editSong', (req, res) => {
    knex('Songs').where({id: req.body.id}).update({
        id: req.body.id, title: req.body.title,
        artist: req.body.artist, releaseYear: req.body.releaseYear})
        .then(song => {res.redirect('/'); })
});

//Updates our database after deleting a record, refereshes the page
app.post('/deleteSong/:id', (req, res) => {
    knex('Songs').where('id', req.params.id).del()
    .then(song => {
        res.redirect("/");
    }).catch(err => {
        console.log(err);
        res.status(500).json({err});
    })
});

//Deletes all the information in the database and calls /addDefault
app.post("/startOver", (req, res) => {
    knex("Songs").del().then(songs => {
        res.redirect("/addDefault");
    });
});

//Reinserts the original songs and reloads the root page
app.get("/addDefault", (req, res) => {
    knex("Songs").insert(
        [
            {title: "Bohemian Rhapsody", artist: "QUEEN", releaseYear: "1975"},
            {title: "Don't Stop Believing", artist: "JOURNEY", releaseYear: "1981"},
            {title: "Hey Jude", artist: "BEATLES", releaseYear: "1968"}
        ]
    ).then(songs => {
        res.redirect("/");
    });
});