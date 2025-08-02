const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const indexRouter = require("./routes/index")
const cors = require("cors");
require("dotenv").config();
const mongoURI = process.env.MONGODB_URI_PROD;

const app = express();

app.use(cors());
app.use(bodyParser.json()); // req.body가 객체로 인식됨
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/api", indexRouter)

mongoose
  .connect(mongoURI, { useNewUrlParser: true })
  .then(() => console.log("mongoose connected"))
  .catch((err) => console.log("DB connection fail", err));

  app.listen(process.env.PORT || 4000, ()=>{
    console.log("server on")
  })