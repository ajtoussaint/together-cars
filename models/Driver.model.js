const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
    tripId: {type:String, required: true},
    name: {type:String, required: true},
    departureLocation: {type:String, required: true},
    pickingUpSelection: {type:String, required: true},
    notes: {type:String, required: false},
    participants: {type:Array, required:true},
})

const Driver = mongoose.model("Driver", driverSchema);

module.exports = Driver;