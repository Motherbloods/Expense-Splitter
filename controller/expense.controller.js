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
    const { name, paidBy, total, participants } = req.body;
    const roomId = req.params.roomId;

    if (!name || !paidBy || !total || !participants) {
      return res.status(400).json({ error: "Semua field harus diisi" });
    }

    if (isNaN(total) || total <= 0) {
      return res
        .status(400)
        .json({ error: "Total harus berupa angka positif" });
    }
    // Memproses daftar participants dan memastikan semuanya dalam huruf kecil tanpa spasi
    let participantsList = participants
      .split(",")
      .map((p) => p.trim().toLowerCase());

    // Memeriksa apakah paidBy ada dalam daftar participants, jika tidak, tambahkan
    if (!participantsList.includes(paidBy.toLowerCase())) {
      participantsList.push(paidBy.toLowerCase());
    }

    // Memperbarui daftar participants di tabel Room
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ error: "Room tidak ditemukan" });
    }

    // Memeriksa apakah paidBy sudah ada di participants dalam Room, jika tidak, tambahkan
    if (!room.participants.includes(paidBy.toLowerCase())) {
      room.participants.push(paidBy.toLowerCase());
      await room.save();
    }

    const expense = new Expense({
      name,
      paidBy,
      total: parseFloat(total),
      participants: participants.split(",").map((p) => p.trim().toLowerCase()),
      room: roomId,
    });

    expense.calculateSplits();
    await expense.save();
    res.json({ success: true, roomId });
  } catch (e) {
    console.error(e);
    res
      .status(500)
      .json({ error: "Terjadi kesalahan saat membuat pengeluaran" });
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
    res.json({ success: true, roomId: expense.room });
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
