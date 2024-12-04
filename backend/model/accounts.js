const mongoose = require("mongoose");

const AccountsSchema = new mongoose.Schema(
  {
    name: {type:String},
    cnic: {type:String},
    pin:{type:Number}
  },
  { timestamps: true }
);

module.exports = mongoose.model("accounts", AccountsSchema);