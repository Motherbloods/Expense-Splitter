const mongoose = require("mongoose");
const { type } = require("os");

const roomSchema = new mongoose.Schema({
  userId: { type: String, ref: "User_splitter" },
  name: { type: String, required: true },
  createdBy: { type: String, required: true },
  participants: [{ type: String, lowercase: true }],
  createdAt: { type: Date, default: Date.now },
});

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;
