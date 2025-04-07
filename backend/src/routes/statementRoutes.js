const express = require("express");
const router = express.Router();
const statementController = require("../controllers/statementController");

// GET /api/statements/monthly/patient/:patientId - Get ALL monthly statements for a specific patient
router.get(
  "/monthly/patient/:patientId",
  statementController.getMonthlyStatementsForPatient
);

// GET /api/statements/monthly/patient/:patientId/:year/:month - Get a specific monthly statement
router.get(
  "/monthly/patient/:patientId/:year/:month",
  statementController.getMonthlyStatementForPatientByMonth
);

// GET /api/statements/financial
router.get("/financial", statementController.getFinancialStatements);

module.exports = router;
