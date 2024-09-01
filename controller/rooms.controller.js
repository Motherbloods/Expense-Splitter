const Room = require("../models/Room");
const Expense = require("../models/Expense");

const list_rooms = async (req, res) => {
  try {
    const rooms = await Room.find({ userId: req.params.userId }).sort({
      createdAt: -1,
    });
    res.render("list_room", { rooms });
  } catch (err) {
    console.error(err);
  }
};

const create_room_form = (req, res) => {
  res.render("create_room", { userId: req.user.id });
};

const deleteRoom = async (req, res) => {
  try {
    console.log(req.params.id);
    const roomId = req.params.id;
    await Room.findByIdAndDelete(roomId);
    res.redirect("/list-rooms/" + req.user.id);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the room." });
  }
};

const create_room = async (req, res) => {
  try {
    const { name, createdBy, participants } = req.body;

    if (!name || !createdBy || !participants) {
      return res.status(400).json({ error: "Semua field harus diisi" });
    }

    const room = new Room({
      name,
      createdBy,
      participants: participants.split(",").map((p) => p.trim()),
      userId: req.user.id, // Gunakan ID pengguna dari sesi
    });
    console.log(req.user.id);

    await room.save();
    res.json({ success: true, userId: req.user.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Terjadi kesalahan saat membuat room" });
  }
};

const dashboard = async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);
    if (!room) {
      res.redirect(`/list-rooms/${req.user.id}`);
    }
    const expenses = await Expense.find({ room: req.params.roomId }).sort({
      createdAt: -1,
    });

    const detailedSplits = calculateDetailedSplits(expenses);
    const finalSplits = calculateSimplifiedSplits(detailedSplits);
    // const settlements = calculateDetailedSettlements(detailedSplits);
    res.render("dashboard", {
      sucess: true,
      room,
      expenses,
      detailedSplits,
      finalSplits,
    });
  } catch (err) {
    console.error(err);
    res.redirect(`/list-rooms/${req.user.id}`);
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
module.exports = {
  list_rooms,
  dashboard,
  create_room,
  create_room_form,
  deleteRoom,
};
