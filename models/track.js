const mongoose = require("mongoose");

const trackSchema = new mongoose.Schema({
    owner: { type: String, required: true }, // username who uploaded
    uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Track", trackSchema);
