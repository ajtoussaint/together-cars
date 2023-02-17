const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require("../models/User.model");
const bcrypt = require("bcrypt");

//slyguy St3ward

module.exports = function(app){
    //passport things that will become a module
    
  passport.serializeUser((user, done) => {
      //console.log("Serialize User called for user " + user.username);
      //console.log("id#: " + user._id);
      done(null, { _id:user._id });
  });

  passport.deserializeUser((id, done) => {
    //console.log('DeserializeUser called')
    User.findOne(
      { _id: id },
      'username',
      (err, user) => {
        //console.log('*** Deserialize user, user:')
        //console.log(user)
        //console.log('--------------')
        done(null, user)
      }
    )
  });

  passport.use(new LocalStrategy(
      function(username, password, done){
          User.findOne({username:username}, function(err, data){
              console.log('User ' +username+' attempted to log in.');
              if(err){
                console.log(err);
                return done(err);
              }
              if (!data) {
                console.log("Found no such user");
                return done(null,false);
              }
              if (!bcrypt.compareSync(password, data.password)){
                console.log('wrong password');
                return done(null,false);
              }
              console.log("I'm in B)");
              return done(null, data);
            });
      }
  ));

  //rotue accessed by passport from auth.js
  app.post("/login",
  passport.authenticate('local'),
  (req, res) =>{
      console.log("logged in: " + req.user);
      //controll what gets sent to the axios "res.data" value here
      res.json({username: req.user.username})
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
      if(!req.body.username || req.body.username.length <3){
        res.json({error:'Username must be at least 3 characters'})
        }else{
        //recieves an object with username and pasword in the body
        const hash = bcrypt.hashSync(req.body.password, 9);
        User.findOne({username:req.body.username}, function(err, user){
            if(err){
                console.log("DB error");
                res.json({ error: "DB error. Try again"});
            }else if(user){
                console.log("registration failed, username taken")
                res.json({ error: "Username is already taken"})
            }else if(req.body.password !== req.body.confirmPassword){
                console.log("registration failed, passwords must match")
                res.json({ error: "Passwords must match"})
            }else if(!passwordIsStrong(req.body.password)){
                res.json({error: "Passwords must be at least 8 characters, contain upper and lowercase letters and a special character: !@#$5^&*()"});
            } else{
                console.log("passed all naming convention checks");
                let newUser = new User({
                    username: req.body.username,
                    password:hash
                });
                newUser.save((err, data) => {
                    if(err){
                        console.log("DB error saving new user");
                        res.json({ error: "DB error. Try again"})
                    }else{
                        console.log("new user created: ", data.username);
                        req.newUserData = data;
                        next(null, data);
                    }
                })
            }
        })
     }
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

    function passwordIsStrong(password){
        if(password.length < 8){
            console.log('short');
            return false;
        }else if(!(/[A-Z]/.test(password))){
            console.log('no uppers');
            return false
        }else if( !(/[a-z]/.test(password))){
            console.log('no lowers');
            return false;
        }else if(!(/[!@#$%^&*()]/.test(password))){
            console.log('not special')
            return false;
        }else if(!(/[1234567890]/.test(password))){
            console.log('no number');
            return false
        }else{
            return true;
        }
    }
}