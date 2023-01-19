//basic imports
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const bodyParser = require('body-parser');
require('dotenv').config();

//auth
const passport = require('passport');
const auth = require("./auth.js");
const bcrypt = require('bcrypt');
//session store
const MongoStore = require('connect-mongo');

//database
const mongoose = require('mongoose');
const User = require("./models/User.model");
const Trip = require("./models/Trip.model");

//first connect to the DB
mongoose.set('strictQuery', false);//put this to suppress an update warning

mongoose
 .connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true})
 .then(
  console.log("MongoDB connected!")
  //could put all the code in here to prevent sending data before DB connects
)
.catch(err => console.log(err));

const app = express()

//cors setup...it works. May need adjustment for live server
app.use(function(req, res, next){
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
    if ('OPTIONS' == req.method) {
        res.send(200);
    } else {
        next();
    }
}) 

//body parser middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors({origin:"http://localhost:3000"}));

//set up session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({mongoUrl: process.env.MONGO_URI})
}));

//set up passport with session
app.use(passport.initialize());
app.use(passport.session());

auth();

//!!polish remember to ensure authenticated on all private routes

//rotue accessed by passport from auth.js
app.post("/login",
 passport.authenticate('local'),
 (req, res) =>{
    console.log("logged in: " + req.user);
    //controll what gets sent to the axios "res.data" value here
    let userInfo = {
        username: req.user.username
    };
    console.log("req.session after login: ", req.session);
    res.send(userInfo)
})


//route to check the user for the session

app.get("/user",
 (req,res) => {
    console.log("In GET /user route");
    console.log("req.user:", req.user);
    console.log("req.session :", req.session);
    if(req.user){
        console.log("/user found a user!")
        res.json({user: req.user});
    }else{
        console.log("/user says: no current user");
        res.json({user: null});
    }
 }
)

app.post("/register", 
 (req,res,next) => {
    console.log("Attempting to register new user");
    //recieves an object with username and pasword in the body
    const hash = bcrypt.hashSync(req.body.password, 9);
    User.findOne({username:req.body.username}, function(err, user){
        if(err){
            console.log("DB error");
            res.json({ error: "DB error try again"});
        }else if(user){
            console.log("registration failed, username taken")
            res.json({ error: "Username is already taken"})
        }else if(req.body.password != req.body.confirmPassword){
            console.log("registration failed, passwords must match")
            res.json({ error: "Passwords must match"})
        } else{
            let newUser = new User({
                username: req.body.username,
                password:hash
            });
            newUser.save((err, data) => {
                if(err){
                    console.log("DB error saving new user");
                }else{
                    console.log("new user created: ", data.username);
                    req.newUserData = data;
                    next(null, data);
                }
            })
        }
    })
 }, 
    passport.authenticate('local', {failureRedirect:'/'}),
    (req, res) => {
        console.log("User registered successfully: ", req.newUserData);
        res.json(req.newUserData)
    }
 )

 //logout path
 app.get("/logout", (req, res) => {
    req.logout( err => {
        if(err){
            console.log(err);
        }
        res.json({redirect:"/blue"})
    })
 })

 //business logic paths

 //creating a trip
 app.post("/createTrip", ensureAuthenticated, (req, res) => {
    console.log("Server is creating a trip");
    //trim the text on participant array
    participantArray = req.body.participants.split(",")
    participantArray.forEach( (party, i) => {
        participantArray[i] = party.trim();
    });
    //filters out empry entries
    participantArray = participantArray.filter(party => {
        party.length > 0;
    })
    let newTrip = new Trip({
        title: req.body.title,
        destination: req.body.destination,
        description: req.body.description,
        arrivalTime: req.body.arrivalTime,
        organizer: req.user.username,
        participants: participantArray,
        drivers:[]
    });

    newTrip.save((err, data) => {
        if(err){
            //!!polish send an error if there is an error and have it display
            console.log(err)
        }else{
            //No real reason to send a response since the page redirects away
            res.json(data)
        }
    })
 })

 //get the trips a user is a part of
 app.get('/trips/:username', ensureAuthenticated, (req,res) => {
    console.log("get trips recieved for user: " + req.params.username);
    Trip.find({organizer:req.params.username}, (err,data) => {
        if(err){
            console.log(err);
        }else if(!data){
            res.json({userTrips:[]});
        }else{
            res.json({userTrips:data});
        }
    })
 });

 //get the data for a specific trip
 app.get('/trip/:id', ensureAuthenticated, (req,res) => {
    Trip.findById(req.params.id, (err,data) =>{
        if(err){
            console.log(err);
        }else if(!data){
            res.json(null)
        }else{
            res.json(data);
        }
    })
 });

 //update the driver list on a trip
 app.post('/trip/:id/drivers',ensureAuthenticated, (req,res) => {
    console.log("Updating trip drivers for",req.params.id);
    //find trip by ID
    Trip.findById(req.params.id, (err,data) => {
        if(err){
            console.log(err)
        }else if(!data){
            console.log("no trip found");
        }else{
            data.drivers.push(req.body.newDriver);
            data.save( (err,updatedData) => {
                if(err){
                    console.log(err)
                }else if(!updatedData){
                    console.log("no updated trip found");
                }else{
                    console.log("Sending updated Trip", updatedData);
                    res.json(updatedData);
                }
            })
        }
    })
    //add driver to array

    //save trip

    //return updated Data
 })

//testing paths

app.get('/red', (req,res) => {
    console.log("red requested");
    res.json(["Griff", "Simmons", "Sarge"]);
});

app.get('/blue', (req,res) => {
    console.log("blue requested");
    res.json(["Tucker", "Church", "Caboose"]);
});

function ensureAuthenticated(req,res,next) {
    if(req.isAuthenticated()){
      return next();
    }
    //!!polish replace with a better route for unauthenticated users
    res.redirect('/');
  };

const PORT = process.env.PORT || 5000

app.listen(PORT, () =>{
    console.log("App is running, listening on port " + PORT);
})