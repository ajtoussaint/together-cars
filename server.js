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

//database
const mongoose = require('mongoose');
const User = require("./models/User.model");

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

auth();

//rotue accessed by passport from auth.js
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
                    next(null, data);
                }
            })
        }
    })
 }, 
    passport.authenticate('local', {failureRedirect:'/'}),
    (req, res) => {
        console.log("edit to => redirecting to login");
        //res.redirect("/login");
    }
 )

 //logout path
 app.get("/logout", (req, res) => {
    req.logout( err => {
        if(err){
            console.log(err);
        }
        res.redirect("/");
    })
 })

//testing paths
app.get('/', (req, res) => {
    console.log("req recieved");
    res.send("Youve recieved data from a get request to '/'")
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