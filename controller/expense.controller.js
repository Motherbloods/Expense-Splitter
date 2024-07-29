const Room = require("../models/Room");
const Expense = require("../models/Expense");

const create_expense_form = async (req, res) => {
  try {
    const roomId = req.params.roomId;
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).send("Room not found");
    }
    res.render("create", { roomId, room });
  } catch (e) {
    console.error(e);
  }
};

const create_expense = async (req, res) => {
  try {
    const expense = new Expense({
      ...req.body,
      room: req.params.roomId,
      participants: req.body.participants
        .split(",")
        .map((p) => p.trim().toLowerCase()),
    });
    expense.calculateSplits();
    await expense.save();
    res.redirect(`/dashboard/${req.params.roomId}`);
  } catch (e) {
    console.error(e);
  }
};

const edit_expense_form = async (req, res) => {
  try {
    const roomId = req.params.roomId;
    const expense = await Expense.findById(req.params.expenseId).populate(
      "room"
    );
    res.render("edit", { expense, roomId });
  } catch (e) {
    console.error(e);
  }
};

const update_expense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.expenseId);
    Object.assign(expense, {
      ...req.body,
      participants: req.body.participants
        .split(",")
        .map((p) => p.trim().toLowerCase()),
    });
    expense.calculateSplits();
    await expense.save();
    res.redirect(`/dashboard/${expense.room}`);
  } catch (e) {
    console.error(e);
  }
};

const delete_expense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.expenseId);
    res.redirect(`/dashboard/${expense.room}`);
  } catch (error) {
    res.status(500).send("Error deleting expense");
  }
};

module.exports = {
  create_expense,
  create_expense_form,
  delete_expense,
  edit_expense_form,
  update_expense,
};
