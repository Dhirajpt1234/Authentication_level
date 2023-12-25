//jshint esversion:6
//level 3 : hashing

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const port = process.env.port || 3000;
const encrypt = require("mongoose-encryption");
const bcrypt = require("bcrypt");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

const dbURL = "mongodb://localhost:27017/AuthDB";

mongoose
  .connect(dbURL)
  .then(() => {
    console.log("data base is connnected");
  })
  .catch((err) => {
    console.log("data base is not connected " + err);
  });

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const Auth1 = mongoose.model("Auth1", userSchema);

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  const saltRounds = 10;

  bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
    if (err) {
      console.log("error in generating bcypt " + err);
    } else {
      const auth1User = new Auth1({
        name: req.body.username,
        password: hash,
      });

      auth1User
        .save()
        .then(() => {
          console.log("use is registered");
        })
        .catch((err) => {
          console.log("user is not registed " + err);
        });

      res.render("login");
    }
  });
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  const curr_username = req.body.username;
  const curr_password = req.body.password;

  Auth1.findOne({ name: curr_username })
    .then((user) => {
      bcrypt.compare(curr_password, user.password, function (err, result) {
        // result == true
        if (err) {
          console.log("problem in loggin in " + err);
        } else {
          if (result == true) {
            console.log("successfully logged in");
            res.render("secrets");
          } else {
            console.log("password not matched");
            res.render("login");
          }
        }
      });
    })
    .catch((err) => {
      console.log("user not found");
      res.render("login");
    });
});

app.get("/secrets", (req, res) => {
  res.render("secrets");
});

app.listen(port, () => {
  console.log("server is started at port 3000");
});
