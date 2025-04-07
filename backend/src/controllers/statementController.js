const db = require("../models");
const { MonthlyStatement, FinancialStatement } = db;
const { Op } = require("sequelize");
const { startOfMonth, endOfMonth, parseISO } = require("date-fns");

// Get all Monthly Statements (potentially filter later)
exports.getMonthlyStatements = async (req, res) => {
  try {
    // TODO: Add filtering by patientId, date range etc. based on query params (req.query)
    const statements = await MonthlyStatement.findAll({
      order: [["StatementDate", "DESC"]], // Example ordering
      // include: [{ model: db.KrollPatient, as: 'patient' }] // Optional: include patient details
    });
    res.status(200).json(statements);
  } catch (error) {
    console.error("Error fetching monthly statements:", error);
    res.status(500).json({
      message: "Error fetching monthly statements",
      error: error.message,
    });
  }
};

// Get all Financial Statements (potentially filter later)
exports.getFinancialStatements = async (req, res) => {
  try {
    // TODO: Add filtering by date range etc. based on query params (req.query)
    const statements = await FinancialStatement.findAll({
      order: [["StatementDate", "DESC"]], // Example ordering
    });
    res.status(200).json(statements);
  } catch (error) {
    console.error("Error fetching financial statements:", error);
    res.status(500).json({
      message: "Error fetching financial statements",
      error: error.message,
    });
  }
};

// Get Monthly Statements for a specific patient
exports.getMonthlyStatementsForPatient = async (req, res) => {
  try {
    const patientId = parseInt(req.params.patientId, 10);
    if (isNaN(patientId)) {
      return res.status(400).json({ message: "Invalid patient ID format." });
    }

    // TODO: Add further filtering by date range etc. based on query params (req.query)
    const statements = await MonthlyStatement.findAll({
      where: { PatientId: patientId }, // Filter by patient ID
      order: [["StatementDate", "DESC"]], // Example ordering
      // include: [{ model: db.KrollPatient, as: 'patient' }] // Optional: include patient details
    });

    if (!statements) {
      // Depending on desired behavior, return empty array or 404
      return res.status(200).json([]); // Return empty array if no statements found
      // return res.status(404).json({ message: "No monthly statements found for this patient." });
    }

    res.status(200).json(statements);
  } catch (error) {
    console.error("Error fetching monthly statements for patient:", error);
    res.status(500).json({
      message: "Error fetching monthly statements",
      error: error.message,
    });
  }
};

// Get a specific Monthly Statement for a patient by year and month
exports.getMonthlyStatementForPatientByMonth = async (req, res) => {
  try {
    const patientId = parseInt(req.params.patientId, 10);
    const year = parseInt(req.params.year, 10);
    const month = parseInt(req.params.month, 10); // Month (1-12)

    if (
      isNaN(patientId) ||
      isNaN(year) ||
      isNaN(month) ||
      month < 1 ||
      month > 12
    ) {
      return res
        .status(400)
        .json({ message: "Invalid patient ID, year, or month format." });
    }

    // Calculate start and end dates for the target month
    // Ensure month is 0-indexed for Date object
    const targetDate = new Date(year, month - 1, 1);
    const startDate = startOfMonth(targetDate);
    const endDate = endOfMonth(targetDate);

    const statement = await MonthlyStatement.findOne({
      where: {
        PatientId: patientId,
        // Find statement where the statement's period contains the first day of the requested month
        // Or more simply, find the statement matching the exact start/end dates if they are stored precisely
        StartDate: startDate,
        EndDate: endDate,
        // Alternative using StatementDate if it represents the month:
        // StatementDate: {
        //   [Op.gte]: startDate,
        //   [Op.lte]: endDate
        // }
      },
      // include: [{ model: db.KrollPatient, as: 'patient' }] // Optional: include patient details
    });

    if (!statement) {
      return res
        .status(404)
        .json({
          message: "Monthly statement not found for this patient and month.",
        });
    }

    res.status(200).json(statement);
  } catch (error) {
    console.error("Error fetching specific monthly statement:", error);
    res.status(500).json({
      message: "Error fetching monthly statement",
      error: error.message,
    });
  }
};
