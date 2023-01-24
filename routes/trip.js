const Trip = require("../models/Trip.model");
const Participant= require("../models/Participant.model");

module.exports = function(app,ensureAuthenticated){
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
    //!! totally redo this

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

 app.post('/addPassenger', ensureAuthenticated, (req, res) =>{
    //!! totally redo this

    //req body must include trip ID, driver index, passenger name, seat index
    const { tripId, driverIndex, passengerName, seatIndex } = req.body;
    console.log("adding passenger",
    passengerName,
    tripId,
    driverIndex,
     seatIndex)
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

 //Get the trip participants for the Participants component in trip.component.js
 app.get('/participants/:tripId', (req, res) => {
    console.log("gettin' participants for trip ID:" + req.params.tripId);
    Participant.find({tripId:req.params.tripId}, (err,data) =>{
        if(err){
            console.log(err);
        }else{
            console.log("Found participants: ", data);
            res.json(data);
        }
    })

 })
}