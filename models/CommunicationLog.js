const mongoose = require("mongoose");

const CommunicationLogSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
  communicationType: { type: String, required: true },
  communicationDate: { type: Date, required: true },
  notes: { type: String },
});

module.exports = mongoose.model("CommunicationLog", CommunicationLogSchema);
