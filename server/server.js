const express = require("express");
const app = express();
const port = 5000;
const cors = require("cors");
require("dotenv").config();

app.use(express.json());
app.use(cors());
const bodyParser = require("body-parser");

app.get("/", (req, res) => {
  res.send("Hello Priyansh this side");
});

// Parse JSON and URL-encoded form data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Razorpay Route
// const phonepeRoute = require("../routes/phonepe/phonepeRoute");
const phonepeRoute = require("./routes/phonepe/phonepeRoute");
app.use("/api", phonepeRoute);

// app.get("/api/payment", (req, res) => {
//   res.send("Priyansh is in /api/payment route");
// });

// Starting Server
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

// export default app;
