const express = require("express");
const passport = require("passport");
const bodyParser = require("body-parser");
const xsenv = require("@sap/xsenv");
const JWTStrategy = require("@sap/xssec").JWTStrategy;
const fs = require("fs");
const app = express();

const services = xsenv.getServices({ uaa: "nodeuaa" });
const filePath = "./users.json"; // Define the file path correctly

passport.use(new JWTStrategy(services.uaa));

app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.authenticate("JWT", { session: false }));

app.get("/users", function (req, res) {
  var isAuthorized = req.authInfo.checkScope("$XSAPPNAME.Display");
  if (isAuthorized) {
    const users = require("./users.json");
    res.status(200).json(users);
  } else {
    res.status(403).send("Forbidden");
  }
});

app.post("/users", function (req, res) {
  const isAuthorized = req.authInfo.checkScope("$XSAPPNAME.Update");
  if (!isAuthorized) {
    res.status(403).json("Forbidden");
    return;
  }
  const newUser = req.body;
  newUser.id = users.length;
  users.push(newUser);
  fs.writeFile("users.json",JSON.stringify(newUser),err=>{
    if(err){
      console.log(err)
    }
  })
  res.status(200).send(users)
});

const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("myapp listening on port " + port);
});
