const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const { body, validationResult } = require("express-validator");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many login attempts, please try again later",
});

const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Please fill all required fields" });
    }

    const user = await User.findOne({ username }).lean();

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    res.json({ success: true, userId: user._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred. Please try again." });
  }
};

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password, confirmPassword } = req.body;
    if (!username || !password || !confirmPassword) {
      return res.status(400).json({ error: "Please fill all required fields" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters long" });
    }

    const existingUser = await User.findOne({ username }).lean();

    if (existingUser) {
      return res.status(409).json({ error: "Username already exists" });
    }

    const saltRounds = 10;
    const hashPass = await bcrypt.hash(password, saltRounds);
    await User.create({ username, password: hashPass });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred. Please try again." });
  }
};

const logout = (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
};
const login_form = (req, res) => {
  res.render("login_form", { error: null });
};

const register_form = (req, res) => {
  res.render("register_form", { error: null });
};

module.exports = {
  login,
  register,
  register_form,
  login_form,
  logout,
  loginLimiter,
};
