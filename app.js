//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const port = process.env.port || 3000;
const encrypt = require("mongoose-encryption");

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

const secret = "thisisthesecretkeytoencrypt";
userSchema.plugin(encrypt, { secret: secret, encryptFields: ["password"] });

const Auth1 = mongoose.model("Auth1", userSchema);

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  const auth1User = new Auth1({
    name: req.body.username,
    password: req.body.password,
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
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  const curr_username = req.body.username;
  const curr_password = req.body.password;

  // console.log(curr_username + " " + curr_password);

  Auth1.findOne({ name: curr_username })
    .then((user) => {
      console.log(user);
      if (curr_password === user.password) {
        console.log("successfully logged in");
        res.render("secrets");
      } else {
        console.log("password not matched");
        res.render("login");
      }
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
