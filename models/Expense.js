const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
  name: { type: String, required: true },
  paidBy: { type: String, required: true, lowercase: true },
  total: { type: Number, required: true },
  participants: [{ type: String }],
  splits: [
    {
      participant: String,
      amount: Number,
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

expenseSchema.methods.calculateSplits = function () {
  const totalParicipants = this.participants.length;
  const amountPerPerson = this.total / totalParicipants;
  this.splits = this.participants.map((participant) => ({
    participant,
    amount:
      participant === this.paidBy
        ? this.total - amountPerPerson
        : -amountPerPerson,
  }));
};

const Expense = mongoose.model("Expense", expenseSchema);

module.exports = Expense;
