const Trip = require("../models/Trip.model");
const Participant= require("../models/Participant.model");
const Driver= require("../models/Driver.model");

module.exports = function(app,ensureAuthenticated){
    //get the data for a specific trip
 app.get('/api/trip/:id', ensureAuthenticated, (req,res) => {
    Trip.findById(req.params.id, (err,data) =>{
        if(err){
            console.log(err);
            res.status(500).send("Error");
        }else if(!data){
            res.json(null)
        }else{
            res.json(data);
        }
    })
 });


 //Get the trip participants for the Participants component in trip.component.js
 app.get('/api/participants/:tripId', ensureAuthenticated, (req, res) => {
    console.log("gettin' participants for trip ID:" + req.params.tripId);
    Participant.find({tripId:req.params.tripId}, (err,data) =>{
        if(err){
            console.log(err);
            res.status(500).send("Error");
        }else{
            console.log("Found participants: ", data);
            res.json(data);
        }
    })

 })

 //Add a new driver to a trip
 app.post('/api/driver', ensureAuthenticated, (req,res) => {
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
            res.status(500).send("Error");
        }else{
            console.log("created a new driver, ", data.name);
            // Update participant status
            Participant.findOne( {name:req.user.username, tripId:req.body.tripId}, (err, participantData) => {
                if(err){
                    console.log(err);
                    res.status(500).send("Error");
                }else{
                    console.log("updating participant status");
                    participantData.status = "driver";
                    participantData.save( (err, updatedData) => {
                        if(err){
                            console.log(err);
                            res.status(500).send("Error");
                        }else{
                            console.log("participant updated successfully: ", updatedData);
                            res.json(data);
                        }
                    })
                }
            })
                
        }
    })
 })

 //get all the drivers for a trip
 app.get('/api/driver/:tripId', ensureAuthenticated, (req,res) => {
    console.log("getting drivers for trip: ", req.params.tripId);
    Driver.find({tripId:req.params.tripId}, (err,data) =>{
        if(err){
            console.log(err);
            res.status(500).send("Error");
        }else{
            console.log("found drivers", data);
            res.json(data);
        }
    })
 })

 //add a new passenger to a driver
 app.post('/api/passenger/:driverId', ensureAuthenticated, (req,res) => {
    console.log("checking passenger status");
    const { tripId, passengerIndex } = req.body;
    const driverId = req.params.driverId;
    const passenger = req.user.username;
    //find a participant and check their status based on the user and the tripID
    Participant.findOne({name:passenger, tripId:tripId}, (err,data) => {
        if(err){
            console.log(err);
            res.status(500).send("Error");
        }else if(!data){
            console.log("No such participant");
            res.status(500).send("Error");
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
                        res.status(500).send("Error");
                    }else{
                        console.log("Found driver data: ", driverData);
                        //if the driver has no space in the passenger spot return error
                        if( driverData.passengers[passengerIndex]){
                            console.log("Spot has been filled by another user");
                            res.status(500).send("Error");
                            //res.json({error:"This spot is already full"});
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
                                    res.status(500).send("Error");
                                }else{
                                    console.log("driver data update a success: ", updatedDriverData);
                                    console.log("updating participant data");
                                    data.status = "passenger";
                                    data.driverId = updatedDriverData._id;
                                    data.save( (err, updatedData) => {
                                        if(err){
                                            console.log(err);
                                            res.status(500).send("Error");
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

 //remove a passenger from a driver
 app.post('/api/removePassenger/:driverId', ensureAuthenticated, (req,res) => {
    console.log("removing passenger...");
    const driverId = req.params.driverId;
    const {tripId, passengerIndex} = req.body;
    const username = req.user.username;
    //find Driver and update
    Driver.findById(driverId, (err, data) => {
        if(err){
            console.log(err);
            res.status(500).send("Error");
        }else{
            console.log("Found driver: ", data);
            data.passengers[passengerIndex] = null;
            data.markModified("passengers");
            data.save( (err,updatedData) => {
                if(err){
                    console.log(err);
                    res.status(500).send("Error");
                }else{
                    console.log("updated driver: ", updatedData);
                    console.log("updating participant status...");
                    Participant.findOne({name:username,tripId:tripId}, (err,participantData) => {
                        if(err){
                            console.log(err);
                            res.status(500).send("Error");
                        }else{
                            console.log("Found participant: ", participantData);
                            participantData.status = null;
                            participantData.driverId = null;
                            participantData.save( (err,updatedParticipantData) => {
                                if(err){
                                    console.log(err);
                                    res.status(500).send("Error");
                                }else{
                                    console.log("Updated participant: ", updatedParticipantData);
                                    res.json({driver:updatedData, participant:updatedParticipantData});
                                }
                            })
                        }
                    })
                }
            })
        }
    })
 })

 //remove a driver from a trip
  app.post("/api/removeDriver/:driverId", ensureAuthenticated, (req,res) => {
    const driverId = req.params.driverId
    console.log("Removing a driver: ", driverId);
    Driver.findById(driverId, (err,driverData) => {
        if(err){
            console.log(err);
            res.status(500).send("Error");
        }else{
            console.log("Found the driver data: ", driverData);
            //update all passengers and driver to no longer be passengers
            var participantArr = driverData.passengers ?
             [driverData.name, ...Object.values(driverData.passengers).filter(name => name)] :
             [driverData.name];
            console.log("updating the participant's status: ", participantArr)
            Participant.updateMany({name:participantArr, tripId: driverData.tripId},
            {status: null}, (err, updateData) => {
                if(err){
                    console.log(err);
                    res.status(500).send("Error");
                }else{
                    console.log("Updated ", updateData.modifiedCount, " participants");
                    //delete the driver if that all goes well
                    console.log("Deleting Driver");
                    Driver.findByIdAndDelete(driverId, (err, deletedDriver) => {
                        if(err){
                            console.log(err);
                            res.status(500).send("Error");
                        }else{
                            console.log("Deleted driver: ", deletedDriver.name);
                            //respond so front end can update the participants
                            res.json(deletedDriver);
                        }
                    })
                }
            })
        }
    })
  })

  //add a participant to the trip
  app.post("/api/addParticipant/:tripId", ensureAuthenticated, (req, res) => {
    const tripId = req.params.tripId;
    const participantName = req.body.name;

    Participant.findOne({name: participantName, tripId:tripId}, (err,data) => {
        if(err){
            console.log(err);
            res.status(500).send("Error");
        }else if(data){
            console.log("Participant already exists!")
        }else{
            let newParticipant = new Participant({
                tripId: tripId,
                name: participantName,
            });
            console.log('Creating Participant: ', participantName)
            newParticipant.save( (err,saveData) => {
                if(err){
                    res.status(500).send("Error");
                    console.log(err)
                }else{
                    console.log("created new participant: ", saveData);
                    res.json(saveData);
                }
            })
        }
    })

  })

  //remove a participant from a trip
  app.post("/api/removeParticipant/:tripId", ensureAuthenticated, (req, res) => {
    const tripId = req.params.tripId;
    const participantName = req.body.name;

    console.log("Removing ", participantName, " from ", tripId);
    Participant.findOne({name: participantName, tripId:tripId}, (err,partyData) => {
        if(err){
            console.log(err);
            res.status(500).send("Error");
        }else{
            if(partyData.organizer){
                res.json({error: "cannot remove organizer!"})
            }else{
                if(partyData.status == "driver"){
                //delete the driver object if there is one
                console.log("Deleting associated driver: ", participantName, tripId);
                Driver.findOneAndDelete({name:participantName, tripId:tripId}, (err,deletedDriver) => {
                    if(err){
                        console.log(err);
                        res.status(500).send("Error");
                    }else{
                        console.log("Deleted driver: ", deletedDriver);
                        console.log("cleaning up passenger statuses...")
                        var participantArr = deletedDriver.passengers ?
                        [deletedDriver.name, ...Object.values(deletedDriver.passengers).filter(name => name)] :
                        [deletedDriver.name];
                        Participant.updateMany({name:participantArr, tripId:tripId}, {status:null}, (err,updateData) => {
                            if(err){
                                console.log(err);
                                res.status(500).send("Error");
                            }else{
                                console.log("Updated ", updateData.modifiedCount ," participantsstatus")
                                //finally delete the participant itself
                                Participant.findByIdAndDelete(partyData._id, (err,deletedData) =>{
                                    if(err){
                                        console.log(err);
                                        res.status(500).send("Error");
                                    }else{
                                        console.log("Deleted participant");
                                        res.json({error:null});
                                    }
                                })
                            }
                        })
    
                    }
                })
    
    
                }else if(partyData.status == "passenger"){
                //Find the driver
                Driver.findById(partyData.driverId, (err, driverData) => {
                    if(err){
                        console.log(err);
                        res.status(500).send("Error");
                    }else{
                        console.log("updating driver to remove the participant as a passenger");
                        driverData.passengers[Object.values(driverData.passengers).indexOf(partyData.name)] = null;
                        driverData.markModified('passengers');
                        console.log("Saving driver data", driverData);
                        driverData.save( (err, updatedDriverData) => {
                            if(err){
                                console.log(err);
                                res.status(500).send("Error");
                            }else{
                                //finally remove the participant
                                Participant.findByIdAndDelete(partyData._id, (err,deletedData) =>{
                                    if(err){
                                        console.log(err);
                                        res.status(500).send("Error");
                                    }else{
                                        console.log("Deleted participant");
                                        res.json({error:null});
                                    }
                                })
                            }
                        })
                    }
                })
    
                }else{
                    console.log("participant has no relevant status");
                    Participant.findByIdAndDelete(partyData._id, (err,deletedData) =>{
                        if(err){
                            console.log(err);
                            res.status(500).send("Error");
                        }else{
                            console.log("Deleted participant");
                            res.json({error:null});
                        }
                    })
                }
            }
        }
    })
  })

  //remove a trip
  app.post("/api/deleteTrip/:tripId", ensureAuthenticated, (req, res) =>{
    const tripId = req.params.tripId
    console.log("deleting trip: " + tripId);
    //delete the trip (ensures only organizer can delete)
    Trip.findOneAndDelete({_id:tripId, organizer:req.user.username}, (err,data) =>{
        if(err){
            res.status(500).send('Error!');
        }else{
            Participant.deleteMany({tripId: tripId}, (err,data) => {
                if(err){
                    console.log(err)
                    res.status(500).send('Error!');
                }else{
                    console.log('Participants Deleted');
                    Driver.deleteMany({tripId: tripId}, (err,data) => {
                        if(err){
                            console.log(err)
                             res.status(500).send('Error!')
                        }else{
                            console.log("Drivers deleted")
                            res.json({error:null});
                        }
                    })
                }
            })
        }
    })
  })

}