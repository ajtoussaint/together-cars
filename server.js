//basic imports
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const bodyParser = require('body-parser');
require('dotenv').config();

//auth
const passport = require('passport');
const auth = require("./routes/auth.js");
//session store
const MongoStore = require('connect-mongo');

//database
const mongoose = require('mongoose');
const Trip = require("./models/Trip.model");

//create a trip page routing
const createTrip = require("./routes/createTrip.js");

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

auth(app);

createTrip(app, ensureAuthenticated)

//!!polish remember to ensure authenticated on all private routes





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
            //add driver to array
            data.drivers.push(req.body.newDriver);
            //save trip
            data.save( (err,updatedData) => {
                if(err){
                    console.log(err)
                }else if(!updatedData){
                    console.log("no updated trip found");
                }else{
                    //if all goes well return updated data
                    console.log("Sending updated Trip", updatedData);
                    res.json(updatedData);
                }
            })
        }
    })
 })



 //get the trips the user is a participant in

 app.get('/participantTrips', ensureAuthenticated, (req,res) => {
    console.log("recieved request for participant trips", req.user.username);
    Trip.find({"participants.name": req.user.username}, (err,data) => {
        if(err){
            console.log(err)
        }else if(!data){
            console.log("this user is a participant in no trips");
            res.json([]);
        }else{
            console.log("got participant trips:", data.length);
            res.json(data);
        }
    })
 })

 

app.post('/addPassenger', ensureAuthenticated, (req, res) =>{
    //req body must include trip ID, driver index, passenger name, seat index
    const { tripId, driverIndex, passengerName, seatIndex } = req.body;
    console.log("adding passenger",
    passengerName,
    tripId, driverIndex, seatIndex)
    //get the trip from DB
    Trip.findById(tripId, (err, data) => {
        if(err){
            console.log(err);
        }else if(!data){
            res.json({error:"No trip found to add passenger"});
        }else{
                //find the correct driver object
                let myDriver = data.drivers[driverId];
                //check if the seat is still available
                if(myDriver.passengers[seatIndex]){
                    res.json({error:"Seat has already been taken"});
                }else{
                    //add passenger to the seat
                    myDriver.passengers[seatIndex] = passengerName;
                    //!!More work to do
                }
                
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