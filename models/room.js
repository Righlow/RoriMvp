const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
    owner: { type: String, required: true },
    tracks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Track" }]
});

module.exports = mongoose.model("Room", roomSchema);
