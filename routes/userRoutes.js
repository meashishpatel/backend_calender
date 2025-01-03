const express = require("express");
const Company = require("../models/Company");
const CommunicationLog = require("../models/CommunicationLog"); // Corrected path
const router = express.Router();
const moment = require("moment");

// Fetch dashboard data
router.get("/dashboard", async (req, res) => {
  try {
    const companies = await Company.find();
    const dashboardData = await Promise.all(
      companies.map(async (company) => {
        const lastCommunications = await CommunicationLog.find({
          companyId: company._id,
        })
          .sort({ communicationDate: -1 })
          .limit(5);

        const nextCommunication = await CommunicationLog.findOne({
          companyId: company._id,
          communicationDate: { $gte: new Date() },
        }).sort({ communicationDate: 1 });

        return {
          companyId: company._id,
          companyName: company.name,
          lastCommunications,
          nextCommunication,
        };
      })
    );

    res.status(200).json(dashboardData);
  } catch (err) {
    console.error("Error fetching dashboard data:", err.message);
    res.status(500).json({ error: "Failed to fetch dashboard data." });
  }
});

// Create communication log
router.post("/communication", async (req, res) => {
  const { companyId, communicationType, communicationDate, notes } = req.body;

  console.log("Received payload:", {
    companyId,
    communicationType,
    communicationDate,
    notes,
  });

  // Validate required fields
  if (!companyId || !communicationType || !communicationDate) {
    return res
      .status(400)
      .json({
        error:
          "All fields (companyId, communicationType, communicationDate) are required.",
      });
  }

  try {
    // Validate company existence
    const companyExists = await Company.findById(companyId);
    if (!companyExists) {
      return res.status(404).json({ error: "Company not found." });
    }

    // Validate communication date
    const parsedDate = new Date(communicationDate);
    if (isNaN(parsedDate)) {
      return res.status(400).json({ error: "Invalid communication date." });
    }

    if (moment(parsedDate).isBefore(moment(), "day")) {
      return res
        .status(400)
        .json({ error: "Communication date cannot be in the past." });
    }

    // Create communication log
    const communication = await CommunicationLog.create({
      companyId,
      communicationType,
      communicationDate: parsedDate,
      notes,
    });

    res.status(201).json(communication);
  } catch (err) {
    console.error("Error saving communication:", err.message);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Fetch notifications
router.get("/notifications", async (req, res) => {
  try {
    const today = moment().startOf("day");
    const endOfToday = moment().endOf("day");

    const notifications = await CommunicationLog.find({
      communicationDate: { $lte: endOfToday.toDate() },
    });

    const overdue = notifications.filter((log) =>
      moment(log.communicationDate).isBefore(today)
    );

    const dueToday = notifications.filter((log) =>
      moment(log.communicationDate).isBetween(today, endOfToday, null, "[]")
    );

    res.status(200).json({ overdue, dueToday });
  } catch (err) {
    console.error("Error fetching notifications:", err.message);
    res.status(500).json({ error: "Failed to fetch notifications." });
  }
});

// Fetch calendar data
router.get("/calendar", async (req, res) => {
  try {
    const logs = await CommunicationLog.find().sort({ communicationDate: 1 });
    const today = new Date();

    const pastCommunications = logs.filter(
      (log) => new Date(log.communicationDate) < today
    );
    const futureCommunications = logs.filter(
      (log) => new Date(log.communicationDate) >= today
    );

    res.status(200).json({ pastCommunications, futureCommunications });
  } catch (err) {
    console.error("Error fetching calendar data:", err.message);
    res.status(500).json({ error: "Failed to fetch calendar data." });
  }
});

module.exports = router;
