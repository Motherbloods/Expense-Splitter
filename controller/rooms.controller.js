const Room = require("../models/Room");
const Expense = require("../models/Expense");

const list_rooms = async (req, res) => {
  try {
    const rooms = await Room.find().sort({ createdAt: -1 });
    res.render("list_room", { rooms });
  } catch (err) {
    console.error(err);
  }
};

const create_room_form = (req, res) => {
  res.render("create_room");
};

const create_room = async (req, res) => {
  try {
    const room = new Room(req.body);
    await room.save();
    res.redirect("/");
  } catch (err) {
    console.error(err);
  }
};

const dashboard = async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomID);
    if (!room) {
      res.redirect("/");
    }
    const expenses = await Expense.find({ room: req.params.roomID }).sort({
      createdAt: -1,
    });

    const detailedSplits = calculateDetailedSplits(expenses);
    const finalSplits = calculateSimplifiedSplits(detailedSplits);
    // const settlements = calculateDetailedSettlements(detailedSplits);
    res.render("dashboard", { room, expenses, detailedSplits, finalSplits });
  } catch (err) {
    console.error(err);
  }
};

function calculateDetailedSplits(expenses) {
  const splits = {};

  expenses.forEach((expense) => {
    const perPersonAmount = expense.total / expense.participants.length;
    expense.participants.forEach((participant) => {
      if (!splits[participant]) splits[participant] = {};
      if (!splits[participant][expense.paidBy])
        splits[participant][expense.paidBy] = 0;

      splits[participant][expense.paidBy] -= perPersonAmount;
    });

    if (!splits[expense.paidBy]) splits[expense.paidBy] = {};
    if (!splits[expense.paidBy][expense.paidBy])
      splits[expense.paidBy][expense.paidBy] = 0;
    splits[expense.paidBy][expense.paidBy] += expense.total;
  });

  return splits;
}

function calculateSimplifiedSplits(detailedSplits) {
  const simplifiedSplits = {};

  for (const participant in detailedSplits) {
    for (const receiver in detailedSplits[participant]) {
      if (participant !== receiver) {
        const amount = detailedSplits[participant][receiver];

        if (!simplifiedSplits[participant]) {
          simplifiedSplits[participant] = {};
        }
        if (!simplifiedSplits[receiver]) {
          simplifiedSplits[receiver] = {};
        }

        simplifiedSplits[participant][receiver] =
          (simplifiedSplits[participant][receiver] || 0) + amount;
        simplifiedSplits[receiver][participant] =
          (simplifiedSplits[receiver][participant] || 0) - amount;
      }
    }
  }

  const finalSplits = {};
  for (const participant in simplifiedSplits) {
    for (const receiver in simplifiedSplits[participant]) {
      const amount = simplifiedSplits[participant][receiver];
      if (amount > 0) {
        if (!finalSplits[participant]) {
          finalSplits[participant] = {};
        }
        finalSplits[participant][receiver] = amount;
      }
    }
  }

  return finalSplits;
}

function calculateDetailedSettlements(detailedSplits) {
  const settlements = [];

  Object.entries(detailedSplits).forEach(([payer, receivers]) => {
    Object.entries(receivers).forEach(([receiver, amount]) => {
      if (amount > 0 && payer !== receiver) {
        settlements.push({
          from: payer,
          to: receiver,
          amount: Number(amount.toFixed(2)),
        });
      }
    });
  });

  return settlements;
}
module.exports = { list_rooms, dashboard, create_room, create_room_form };
