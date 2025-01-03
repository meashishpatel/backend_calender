const express = require("express");
const Company = require("../models/Company");
const CommunicationMethod = require("../models/CommunicationMethod");
const router = express.Router();

// Create a new company
router.post("/companies", async (req, res) => {
  try {
    const {
      name,
      location,
      linkedin,
      emails,
      phones,
      comments,
      communicationPeriodicity,
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Company name is required." });
    }

    const company = new Company({
      name,
      location,
      linkedin,
      emails,
      phones,
      comments,
      communicationPeriodicity: communicationPeriodicity || "2 weeks",
    });

    const savedCompany = await company.save();
    res.status(201).json(savedCompany);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all companies
router.get("/companies", async (req, res) => {
  try {
    const companies = await Company.find();
    res.status(200).json(companies);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch companies." });
  }
});

// Edit a company
router.put("/companies/:id", async (req, res) => {
  try {
    const {
      name,
      location,
      linkedin,
      emails,
      phones,
      comments,
      communicationPeriodicity,
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Company name is required." });
    }

    const updatedCompany = await Company.findByIdAndUpdate(
      req.params.id,
      {
        name,
        location,
        linkedin,
        emails,
        phones,
        comments,
        communicationPeriodicity,
      },
      { new: true }
    );

    if (!updatedCompany) {
      return res.status(404).json({ error: "Company not found." });
    }

    res.status(200).json(updatedCompany);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a company
router.delete("/companies/:id", async (req, res) => {
  try {
    const deletedCompany = await Company.findByIdAndDelete(req.params.id);

    if (!deletedCompany) {
      return res.status(404).json({ error: "Company not found." });
    }

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete company." });
  }
});

// Add default communication methods (Prevent duplication)
// router.post("/communication-methods", async (req, res) => {
//   try {
//     const existingMethods = await CommunicationMethod.find();
//     if (existingMethods.length > 0) {
//       return res.status(400).json({ error: "Default methods already exist." });
//     }

//     const methods = [
//       {
//         name: "LinkedIn Post",
//         description: "Post on LinkedIn",
//         sequence: 1,
//         mandatory: true,
//       },
//       {
//         name: "LinkedIn Message",
//         description: "Send a LinkedIn message",
//         sequence: 2,
//         mandatory: true,
//       },
//       {
//         name: "Email",
//         description: "Send an email",
//         sequence: 3,
//         mandatory: true,
//       },
//       {
//         name: "Phone Call",
//         description: "Call the contact",
//         sequence: 4,
//         mandatory: false,
//       },
//       {
//         name: "Other",
//         description: "Any other communication method",
//         sequence: 5,
//         mandatory: false,
//       },
//     ];

//     const createdMethods = await CommunicationMethod.insertMany(methods);
//     res.status(201).json(createdMethods);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// Get all communication methods
router.get("/communication-methods", async (req, res) => {
  try {
    const methods = await CommunicationMethod.find().sort("sequence");
    res.status(200).json(methods);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch communication methods." });
  }
});

// Update a communication method
router.put("/communication-methods/:id", async (req, res) => {
  try {
    const { name, description, sequence, mandatory } = req.body;

    if (
      !name ||
      !description ||
      sequence === undefined ||
      mandatory === undefined
    ) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const updatedMethod = await CommunicationMethod.findByIdAndUpdate(
      req.params.id,
      { name, description, sequence, mandatory },
      { new: true }
    );

    if (!updatedMethod) {
      return res.status(404).json({ error: "Communication method not found." });
    }

    res.status(200).json(updatedMethod);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a communication method
router.delete("/communication-methods/:id", async (req, res) => {
  try {
    const deletedMethod = await CommunicationMethod.findByIdAndDelete(
      req.params.id
    );

    if (!deletedMethod) {
      return res.status(404).json({ error: "Communication method not found." });
    }

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete communication method." });
  }
});

// Add default communication methods
router.post("/communication-methods", async (req, res) => {
  try {
    const { type, description, sequence, mandatory } = req.body;

    // Log the request body for debugging
    console.log("Request Body:", req.body);

    // Validation: Ensure all fields are provided
    if (
      !type ||
      !description ||
      sequence === undefined ||
      mandatory === undefined
    ) {
      return res.status(400).json({
        error:
          "All fields (type, description, sequence, mandatory) are required.",
      });
    }

    // Create and save the method
    const method = new CommunicationMethod({
      type,
      description,
      sequence,
      mandatory,
    });
    const savedMethod = await method.save();
    res.status(201).json(savedMethod);
  } catch (err) {
    console.error("Error saving communication method:", err.message);
    res.status(500).json({ error: "Failed to save communication method." });
  }
});

module.exports = router;
