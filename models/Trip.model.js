const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema({
    title: {type:String, required: true},
    destination: {type:String, required: true},
    description: {type:String, required: true},
    arrivalTime: {type:String, required: true},
    organizer: {type:String, required: true},
    //!! specify this is an array of strings for easy searching
    participants: {type:Array, required:true},
    drivers: {type:Array, required: true}
})

//drivers is an array of objects which have more driver info

const Trip = mongoose.model("Trip",tripSchema);

module.exports = Trip;