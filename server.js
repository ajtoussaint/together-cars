const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express()

//body parser middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());

//set up session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: {secure: false}
}));

//set up passport with session
app.use(passport.initialize());
app.use(passport.session());

//passport things that will become a module
passport.serializeUser((user, done) => {
    console.log("Serialize User called for user " + user.username);
    console.log("id#: " + user._id);
    done(null, user._id);
});

passport.deserializeUser((id, done) => {
    console.log("Deserialize User called " + id);
    let myUsers = {
        "007":{
            username:"Andrew",
            password:"badger",
            _id:"007"
        }
    }
    //should return the user associated with the id given
    done(null, myUsers[id]);
});

passport.use(new LocalStrategy(
    function(username, password, done){
        console.log("Using local strategy...", username, password);
        //find the user in the database
        let myUsers = {
            "007":{
                username:"Andrew",
                password:"badger",
                _id:"007"
            }
        }
        //check cridentials (for only user)
        if(password != "badger" && username != "Andrew"){
            console.log("wrong username/password");
            return done(null,false);
        }else{
            console.log("Welcome " + myUsers["007"].username)
            return done(null, myUsers["007"])
        }

    }
));

app.post("/login",
 passport.authenticate('local', {failureRedirect:'/'}),
 (req, res) =>{
    console.log("login attempt: " + req.user.username);
    //controll what gets sent to the axios "res.data" value here
    var userInfo = {
        username: req.user.username,
        favorite: "blue"
    };
    res.send(userInfo)
})
    

//end passport setup

//route to check the user for the session

app.get("/user",
 (req,res) => {
    console.log("In get /user route");
    console.log(req.user);
    if(req.user){
        res.json({data: req.user})
    }else{
        console.log("no current user");
        res.json(null)
    }
 }
)


app.get('/', (req, res) => {
    console.log("req recieved");
    res.send("hello world")
});

app.get('/red', (req,res) => {
    console.log("red requested");
    res.json(["Griff", "Simmons", "Sarge"]);
});

app.get('/blue', (req,res) => {
    console.log("blue requested");
    res.json(["Tucker", "Church", "Caboose"]);
});

const PORT = process.env.PORT || 5000

app.listen(PORT, () =>{
    console.log("App is running, listening on port " + PORT);
})