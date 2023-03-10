const mongoose = require("mongoose");

const participantSchema = new mongoose.Schema({
    tripId: {type:String, required: true},
    name: {type:String, required: true},
    status: {type:String, required: false},
    driverId: {type:String, required:false},
    organizer: {type:Boolean, required: false},
})


const Participant = mongoose.model("Participant", participantSchema);

module.exports = Participant;