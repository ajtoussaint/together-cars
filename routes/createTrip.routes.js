const Trip = require("../models/Trip.model");
const User = require("../models/User.model");
const Participant= require("../models/Participant.model");

module.exports = function(app, ensureAuthenticated){
    
 //creating a trip
 app.post("/api/createTrip", ensureAuthenticated, (req, res) => {
    console.log("Server is creating a trip");
    //!!participants should be validated as valid usernames by the form
    //participants come in as an array ob objects {name:username, status:(null/driver/passenger)}
    //!!may need to add the user to this array here or in create-trip.js

    let newTrip = new Trip({
        title: req.body.title,
        destination: req.body.destination,
        description: req.body.description,
        arrivalTime: req.body.arrivalTime,
        organizer: req.user.username,
    });

    newTrip.save((err, data) => {
        if(err){
            //!!polish send an error if there is an error and have it display
            console.log(err)
            res.status(500).send("Error");
        }else if(!data){
            console.log("Error creating a new trip");
            res.status(500).send("Error");
        }else{
            console.log("created trip: ", data);
            //!! create participants for everyone in the participants array
            var participantArray = []
            //add the organizer as a participant
            participantArray.push({
                tripId:data._id,
                name:req.user.username,
                organizer:true,
            })
            //add all participants in the trip to the array
            req.body.participants.forEach( party => {
                participantArray.push({
                    tripId:data._id,
                    name:party,
                })
            });

            console.log("Participant Array: ", participantArray);

            Participant.create(participantArray, (err) =>{
                if(err){
                    console.log(err)
                    res.status(500).send("Error");
                }else{
                    res.json(data);
                }
            })
        }
    })
 })

 app.post('/api/validateUsername', ensureAuthenticated, (req,res) => {
    console.log("validating username...", req.body.username);
    User.findOne({username:req.body.username}, (err, data) => {
        if(err){
            console.log(err);
            res.status(500).send("Error");
        }else if(!data){
            console.log("user is not valid");
            res.json({validUser:false});
        }else{
            res.json({validUser:true});
            console.log("user is valid");
        }
    })
 });


}