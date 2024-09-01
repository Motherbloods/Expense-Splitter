const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const csrf = require("csurf");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// CSRF protection
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

// Provide CSRF token to all views
app.use(function (req, res, next) {
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.get("/", (req, res) => {
  res.redirect("/login");
});

app.use(express.static(path.join(__dirname, "../public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

// Error handler for CSRF
app.use(function (err, req, res, next) {
  if (err.code !== "EBADCSRFTOKEN") return next(err);
  res.status(403).send("Form tampered with");
});

module.exports = app;
