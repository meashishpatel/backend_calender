const mongoose = require("mongoose");

const CommunicationMethodSchema = new mongoose.Schema({
  type: { type: String, required: true },
  description: { type: String, required: true },
  sequence: { type: Number, required: true },
  mandatory: { type: Boolean, required: true },
});

module.exports = mongoose.model(
  "CommunicationMethod",
  CommunicationMethodSchema
);
