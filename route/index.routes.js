const express = require("express");
const router = express.Router();
const {
  isNotLogged,
  isLogged,
  verifyResourceOwnership,
} = require("../middleware/user.middleware");
const {
  create_expense_form,
  create_expense,
  update_expense,
  delete_expense,
  edit_expense_form,
} = require("../controller/expense.controller");

const {
  list_rooms,
  create_room,
  create_room_form,
  dashboard,
  deleteRoom,
} = require("../controller/rooms.controller");

const {
  register,
  login,
  register_form,
  login_form,
  loginLimiter,
  logout,
} = require("../controller/auth.controller");

// Room Routes
router.get(
  "/list-rooms/:userId",
  isLogged,
  verifyResourceOwnership("user"),
  list_rooms
);
router.get("/create-room", isLogged, create_room_form);
router.get(
  "/dashboard/:roomId",
  isLogged,
  verifyResourceOwnership("room"),
  dashboard
);
router.post("/create-room", isLogged, create_room);
router.post(
  "/delete-room/:id",
  isLogged,
  verifyResourceOwnership("room"),
  deleteRoom
);

// Expense Routes
router.get(
  "/create/:roomId",
  isLogged,
  verifyResourceOwnership("room"),
  create_expense_form
);
router.post(
  "/create/:roomId",
  isLogged,
  verifyResourceOwnership("room"),
  create_expense
);
router.get(
  "/edit/:expenseId",
  isLogged,
  verifyResourceOwnership("expense"),
  edit_expense_form
);
router.post(
  "/edit/:expenseId",
  isLogged,
  verifyResourceOwnership("expense"),
  update_expense
);
router.post(
  "/delete/:expenseId",
  isLogged,
  verifyResourceOwnership("expense"),
  delete_expense
);

//Auth Routes
router.get("/register", isNotLogged, register_form);
router.post("/register", isNotLogged, register);
router.get("/login", isNotLogged, login_form);
router.post("/login", loginLimiter, isNotLogged, login);
router.post("/logout", isLogged, logout);

module.exports = router;
