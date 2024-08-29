const mongoose = require("mongoose");


const dbConnect = () => {
  mongoose
.connect("mongodb+srv://pledith31:brijesh1715@cluster0.crjzm.mongodb.net/paytm")
    .then(() => console.log("DB connected successfully"))
    .catch(() => console.log("DB connection failed"));
};

module.exports = dbConnect;
