const mongoose = require("mongoose");

const ATMBalance = new mongoose.Schema({
    denomination5000: { type: Number, default: 0 },
    denomination1000: { type: Number, default: 0 },
    denomination500: { type: Number, default: 0 },
});


module.exports = mongoose.model("atmBalance", ATMBalance);