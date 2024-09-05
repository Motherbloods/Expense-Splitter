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
    const { finalSplits, evenParticipants } =
      calculateSimplifiedSplits(detailedSplits);

    res.render("dashboard", {
      sucess: true,
      room,
      expenses,
      detailedSplits,
      finalSplits,
      evenParticipants,
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
      if (!splits[participant][expense.paidBy]) {
        splits[participant][expense.paidBy] = { total: 0, details: {} };
      }

      splits[participant][expense.paidBy].total -= perPersonAmount;
      splits[participant][expense.paidBy].details[expense.name] =
        -perPersonAmount;
    });

    if (!splits[expense.paidBy]) splits[expense.paidBy] = {};
    if (!splits[expense.paidBy][expense.paidBy]) {
      splits[expense.paidBy][expense.paidBy] = { total: 0, details: {} };
    }
    splits[expense.paidBy][expense.paidBy].total += expense.total;
    splits[expense.paidBy][expense.paidBy].details[expense.name] =
      expense.total;
  });

  return splits;
}

function calculateSimplifiedSplits(detailedSplits) {
  const simplifiedSplits = {};
  const evenParticipants = {};

  for (const participant in detailedSplits) {
    for (const receiver in detailedSplits[participant]) {
      if (participant !== receiver) {
        const { total, details } = detailedSplits[participant][receiver];

        if (!simplifiedSplits[participant]) {
          simplifiedSplits[participant] = {};
        }
        if (!simplifiedSplits[receiver]) {
          simplifiedSplits[receiver] = {};
        }

        if (!simplifiedSplits[participant][receiver]) {
          simplifiedSplits[participant][receiver] = { total: 0, details: {} };
        }
        if (!simplifiedSplits[receiver][participant]) {
          simplifiedSplits[receiver][participant] = { total: 0, details: {} };
        }

        simplifiedSplits[participant][receiver].total += total;
        simplifiedSplits[receiver][participant].total -= total;

        for (const expenseName in details) {
          if (!simplifiedSplits[participant][receiver].details[expenseName]) {
            simplifiedSplits[participant][receiver].details[expenseName] = 0;
          }
          simplifiedSplits[participant][receiver].details[expenseName] +=
            details[expenseName];
        }
      }
    }
  }

  const finalSplits = {};
  for (const participant in simplifiedSplits) {
    for (const receiver in simplifiedSplits[participant]) {
      const { total, details } = simplifiedSplits[participant][receiver];
      if (total > 0) {
        if (!finalSplits[participant]) {
          finalSplits[participant] = {};
        }
        finalSplits[participant][receiver] = { total, details };
      } else if (total === 0) {
        const key = [participant, receiver].sort().join("-");
        if (!evenParticipants[key]) {
          evenParticipants[key] = {
            participants: [participant, receiver],
            details: {},
          };
        }
        // Merge details from both directions, preserving who paid for each expense
        for (const [expenseName, amount] of Object.entries(details)) {
          evenParticipants[key].details[expenseName] = {
            amount: Math.abs(amount),
            paidBy: amount > 0 ? participant : receiver,
          };
        }
        for (const [expenseName, amount] of Object.entries(
          simplifiedSplits[receiver][participant].details
        )) {
          if (!evenParticipants[key].details[expenseName]) {
            evenParticipants[key].details[expenseName] = {
              amount: Math.abs(amount),
              paidBy: amount > 0 ? receiver : participant,
            };
          }
        }
      }
    }
  }

  return { finalSplits, evenParticipants };
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
