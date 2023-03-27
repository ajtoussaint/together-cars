//basic imports
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env')});

//auth
const passport = require('passport');
const auth = require("./routes/auth.routes.js");
//session store
const MongoStore = require('connect-mongo');

//database
const mongoose = require('mongoose');
const Trip = require("./models/Trip.model");
const Participant = require("./models/Participant.model");

//create a trip page routing
const createTrip = require("./routes/createTrip.routes.js");
//trip page routing
const tripRoutes = require("./routes/trip.routes.js");

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

app.use(cors({origin: process.env.NODE_ENV === 'production' ?
"https://togethercars.dev" :
"http://localhost:3000"
}));

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

auth(app);

createTrip(app, ensureAuthenticated);

tripRoutes(app, ensureAuthenticated);

//!!polish remember to ensure authenticated on all private routes

 //get the trips a user is organizing
 app.get('/trips/:username', ensureAuthenticated, (req,res) => {
    console.log("get trips recieved for user: " + req.params.username);
    Trip.find({organizer:req.params.username}, (err,data) => {
        if(err){
            console.log(err);
            res.status(500).send("Couldn't get Trip Data");
        }else if(!data){
            res.json({userTrips:[]});
        }else{
            res.json({userTrips:data});
        }
    })
 });

 //get the trips the user is a participant in

 app.get('/participantTrips', ensureAuthenticated, (req,res) => {
    console.log("recieved request for participant trips", req.user.username);
    Participant.find({name:req.user.username}, (err,data) => {
        if(err){
            console.log(err);
            res.status(500).send("Error");
        }else if(!data){
            res.json([]);
        }else{
            //console.log("Found user's participant objects", data);
            var idArr = []
            data.forEach( party => {
                idArr.push(party.tripId);
            });
            Trip.find({'_id': {$in: idArr}}, (err,tripData) => {
                if(err){
                    console.log(err);
                }else{
                    //console.log("Found data on user's participant trips: ", tripData);
                    res.json(tripData);
                }
            })
        }
    })
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