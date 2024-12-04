const express = require("express");
const app = express();
const mongoose = require("mongoose");
const routes = require("./routes");
const cors =require("cors")
const path = require("path")


app.use(cors())
app.use(express.json());
app.use('/invoices', express.static(path.join(__dirname, 'controllers', 'invoices')));
app.use("/v1/test", routes.accounts);
app.listen(9000, () => {
  mongoose
    .connect(
      "mongodb+srv://user_004:strong890@cluster0.w8zo3.mongodb.net/accounting?retryWrites=true&w=majority"
    )
    .then(() => console.log("Server and Database Connected"))
    .catch((err) => {
      console.log(err);
    });
});