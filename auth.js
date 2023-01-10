const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require("./models/User.model");

module.exports = function(){
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
}