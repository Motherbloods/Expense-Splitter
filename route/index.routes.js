const express = require("express");
const router = express.Router();
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
} = require("../controller/rooms.controller");

//Room Routes
router.get("/", list_rooms);
router.get("/create-room", create_room_form);
router.get("/dashboard/:roomID", dashboard);
router.post("/create-room", create_room);

//Expense Routes
router.get("/create/:roomId", create_expense_form);
router.post("/create/:roomId", create_expense);
router.get("/edit/:expenseId", edit_expense_form);
router.post("/edit/:expenseId", update_expense);
router.post("/delete/:expenseId", delete_expense);

module.exports = router;
