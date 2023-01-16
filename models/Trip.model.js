const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema({
    title: {type:String, required: true},
    destination: {type:String, required: true},
    description: {type:String, required: true},
    arrivalTime: {type:String, required: true},
    organizer: {type:String, required: true},
    participants: {type:Array, required:true},
    drivers: {type:Array, required: true}
})

const Trip = mongoose.model("Trip",tripSchema);

module.exports = Trip;