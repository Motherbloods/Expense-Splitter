const jwt = require("jsonwebtoken");
const Room = require("../models/Room");
const Expense = require("../models/Expense");

const isLogged = (req, res, next) => {
  const token = req.cookies.token;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      res.clearCookie("token");
      res.redirect("/login");
    }
  } else {
    res.redirect("/login");
  }
};

const isNotLogged = (req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded && decoded.id) {
        return res.redirect(`/list-rooms/${decoded.id}`);
      }
    } catch (err) {
      res.clearCookie("token");
    }
  }
  next();
};

const verifyResourceOwnership = (resourceType) => async (req, res, next) => {
  try {
    let resource;
    let ownerId;

    // Jika pengguna mencoba mengakses halaman list-rooms mereka sendiri, izinkan
    if (resourceType === "user" && req.params.userId === req.user.id) {
      return next();
    }

    switch (resourceType) {
      case "user":
        if (req.user.id !== req.params.userId) {
          return res.redirect(`/list-rooms/${req.user.id}`);
        }
        return next();
      case "room":
        resource = await Room.findById(req.params.roomId || req.params.id);
        ownerId = resource ? resource.userId.toString() : null;
        break;
      case "expense":
        console.log("ini expense", req.params.expenseId);
        resource = await Expense.findById(req.params.expenseId);
        if (resource) {
          const room = await Room.findById(resource.room);
          ownerId = room ? room.userId.toString() : null;
        }
        break;
      default:
        return res.redirect(`/list-rooms/${req.user.id}`);
    }

    if (!resource || ownerId !== req.user.id) {
      // Tambahkan pengecekan untuk menghindari redirect berulang
      if (req.originalUrl !== `/list-rooms/${req.user.id}`) {
        return res.redirect(`/list-rooms/${req.user.id}`);
      } else {
        // Jika sudah di halaman list-rooms, kirim pesan error
        return res.status(403).send("Access denied");
      }
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};
module.exports = { isNotLogged, isLogged, verifyResourceOwnership };
