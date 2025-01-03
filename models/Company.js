const mongoose = require("mongoose");
const CompanySchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: String,
  linkedin: String,
  emails: [String],
  phones: [String],
  comments: String,
  communicationPeriodicity: {
    type: String,
    default: function () {
      return this.communicationPeriodicity || "2 weeks";
    },
  },
});
module.exports = mongoose.model("Company", CompanySchema);
