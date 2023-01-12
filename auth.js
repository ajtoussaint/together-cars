const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require("./models/User.model");
const bcrypt = require("bcrypt");

module.exports = function(){
    //passport things that will become a module
passport.serializeUser((user, done) => {
    console.log("Serialize User called for user " + user.username);
    console.log("id#: " + user._id);
    done(null, { _id:user._id });
});

passport.deserializeUser((id, done) => {
  console.log('DeserializeUser called')
	User.findOne(
		{ _id: id },
		'username',
		(err, user) => {
			console.log('*** Deserialize user, user:')
			console.log(user)
			console.log('--------------')
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
}