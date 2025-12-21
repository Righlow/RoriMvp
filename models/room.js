const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
    roomName: { type: String, required: true },
    createdBy: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
//
    brandText: {
        type: String,
        default: "WELCOME TO SONIQ SPACE"
    },

    visuals: {
        camRadius: Number,
        camSpeed: Number,
        waveIntensity: Number,
        tubeSpin: Number,
        colorTheme: String
    }
});

const Room = mongoose.model("Room", roomSchema);

async function createRoom(roomName, username, visuals, brandText) {
    const room = new Room({
        roomName,
        createdBy: username,
        visuals,
        brandText
    });

    const saved = await room.save();
    console.log(" ROOM SAVED :", saved._id);
    return saved;
}

async function getRoom(id) {
    return await Room.findById(id);
}

module.exports = { createRoom, getRoom };
