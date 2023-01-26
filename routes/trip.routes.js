const Trip = require("../models/Trip.model");
const Participant= require("../models/Participant.model");
const Driver= require("../models/Driver.model");

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


 //Get the trip participants for the Participants component in trip.component.js
 app.get('/participants/:tripId', ensureAuthenticated, (req, res) => {
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

 //Add a new driver to a trip
 app.post('/driver', ensureAuthenticated, (req,res) => {
    //!!Ensure a user cannot drive twice or drive and be a passenger in the same trip
    console.log("creating new driver ", req.body.name, "for trip ", req.body.trip);
    //reduce the passenger array to an object to preserve order
    var passengerObject = req.body.passengers.reduce( (obj, passenger, index ) => {
        obj[index] = passenger;
        return obj;
    }, {});

    let newDriver = new Driver({
        tripId: req.body.tripId,
        name: req.user.username,
        departureLocation: req.body.departureLocation,
        pickingUpSelection: req.body.pickingUpSelection,
        notes: req.body.notes,
        passengers: passengerObject,
    })

    newDriver.save( (err,data) => {
        if(err){
            console.log(err);
        }else{
            console.log("created a new driver, ", data.name);
            //!! Update participant status
            res.json(data);
        }
    })
 })

 app.get('/driver/:tripId', ensureAuthenticated, (req,res) => {
    console.log("getting drivers for trip: ", req.params.tripId);
    Driver.find({tripId:req.params.tripId}, (err,data) =>{
        if(err){
            console.log(err);
        }else{
            console.log("found drivers", data);
            res.json(data);
        }
    })
 })

 app.post('/passenger/:driverId', ensureAuthenticated, (req,res) => {
    console.log("checking passenger status");
    const { tripId, passengerIndex } = req.body;
    const driverId = req.params.driverId;
    const passenger = req.user.username;
    //find a participant and check their status based on the user and the tripID
    Participant.findOne({name:passenger, tripId:tripId}, (err,data) => {
        if(err){
            console.log(err);
        }else if(!data){
            console.log("No such participant");
            //!! res and error
        }else{
            console.log("Found participant: ", data);
            if(data.status){
                console.log("Participant already in a roll");
                res.json({error:"Participant is already a:" + data.status});
            }else{
                //The participant has no status
                //get the driver
                Driver.findById(driverId, (err, driverData) => {
                    if(err){
                        console.log(err);
                    }else{
                        console.log("Found driver data: ", driverData);
                        //if the driver has no space in the passenger spot return error
                        if( driverData.passengers[passengerIndex]){
                            console.log("Spot has been filled by another user");
                            res.json({error:"This spot is already full"});
                        }else{
                            //update the driver
                            driverData.passengers[passengerIndex] = passenger;
                            //need this for .save() to recognize the change
                            driverData.markModified('passengers');
                            console.log("Saving driver data", driverData);
                            //set participant status to passenger
                            driverData.save( (err,updatedDriverData) => {
                                if(err){
                                    console.log(err);
                                }else{
                                    console.log("driver data update a success: ", updatedDriverData);
                                    console.log("updating participant data");
                                    data.status = "passenger";
                                    data.save( (err, updatedData) => {
                                        if(err){
                                            console.log(err);
                                        }else{
                                            console.log("Participant add complete", updatedDriverData, updatedData)
                                            res.json({
                                                driver:updatedDriverData,
                                                participant: updatedData
                                            })
                                        }
                                    })
                                }
                            })
                        }
                    }
                })
            }
        }
    })
 })
}