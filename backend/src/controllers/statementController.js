const db = require("../models");
const { MonthlyStatement, FinancialStatement } = db;
const { Op } = require("sequelize");
const {
  startOfMonth,
  endOfMonth,
  parseISO,
  subMonths,
  format,
} = require("date-fns");

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

// Get Financial Statements (Calculated Real-Time for a given period)
exports.getFinancialStatements = async (req, res) => {
  try {
    // Get period from query params, default to current month
    let startDate, endDate;
    if (req.query.startDate && req.query.endDate) {
      // Basic validation - could add more robust date parsing/validation
      startDate = parseISO(req.query.startDate);
      endDate = parseISO(req.query.endDate);
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({
          message:
            "Invalid startDate or endDate query parameter format. Use ISO 8601 (e.g., YYYY-MM-DD).",
        });
      }
      // Ensure endDate is end of day for accurate comparison if time isn't specified
      endDate.setHours(23, 59, 59, 999);
    } else {
      // Default to current month
      const today = new Date();
      startDate = startOfMonth(today);
      endDate = endOfMonth(today);
    }

    console.log(
      `Calculating financial statement for period: ${startDate.toISOString()} - ${endDate.toISOString()}`
    );

    // Calculate financial data in real-time using the helper
    const statementData = await calculateFinancialStatementData(
      startDate,
      endDate
    );

    // Since we calculate for a period, we always return one statement object
    res.status(200).json(statementData);
  } catch (error) {
    console.error("Error calculating financial statements:", error);
    res.status(500).json({
      message: "Error calculating financial statements",
      error: error.message,
    });
  }
};

// Get Monthly Statements for a specific patient (Calculated Real-Time for last 12 months)
exports.getMonthlyStatementsForPatient = async (req, res) => {
  try {
    const patientId = parseInt(req.params.patientId, 10);
    if (isNaN(patientId)) {
      return res.status(400).json({ message: "Invalid patient ID format." });
    }

    const statements = [];
    const currentDate = new Date();
    const numberOfMonths = 12; // Calculate for the last 12 months including current

    // Loop backwards from the current month for the last N months
    for (let i = 0; i < numberOfMonths; i++) {
      const targetMonthDate = subMonths(currentDate, i);
      const startDate = startOfMonth(targetMonthDate);
      const endDate = endOfMonth(targetMonthDate);

      console.log(
        `Calculating statement for patient ${patientId} - ${format(
          targetMonthDate,
          "yyyy-MM"
        )}`
      );

      // Calculate statement data in real-time using the helper
      // Note: calculateStatementData needs access to db models
      const statementData = await calculateStatementData(
        patientId,
        startDate,
        endDate
      );
      statements.push(statementData);
    }

    // Statements will be ordered newest month first due to loop direction
    // If you want oldest first, you can reverse the loop or sort the array:
    // statements.sort((a, b) => a.StartDate - b.StartDate);

    res.status(200).json(statements);
  } catch (error) {
    console.error("Error calculating monthly statements for patient:", error);
    res.status(500).json({
      message: "Error calculating monthly statements",
      error: error.message,
    });
  }
};

// Get a specific Monthly Statement for a patient by year and month (Calculated Real-Time)
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
    const targetDate = new Date(year, month - 1, 1);
    const startDate = startOfMonth(targetDate);
    const endDate = endOfMonth(targetDate);

    // Calculate statement data in real-time using the helper
    const statementData = await calculateStatementData(
      patientId,
      startDate,
      endDate
    );

    // Note: We are not checking if a statement *exists* in the DB anymore,
    // we are calculating it. If the patient had no activity, the totals will be zero.
    // We could potentially add a check here to return 404 if the patient doesn't exist at all.

    res.status(200).json(statementData);
  } catch (error) {
    console.error("Error calculating specific monthly statement:", error);
    res.status(500).json({
      message: "Error calculating monthly statement",
      error: error.message,
    });
  }
};

// Helper function to calculate statement data for a patient and period
async function calculateStatementData(patientId, startDate, endDate) {
  // 1. Calculate Opening Balance (Closing balance of the previous month)
  const prevMonthEndDate = new Date(startDate.getTime() - 1); // Last millisecond of previous month
  const prevStatement = await MonthlyStatement.findOne({
    where: {
      PatientId: patientId,
      EndDate: { [Op.lt]: startDate },
    },
    order: [["EndDate", "DESC"]],
  });
  const openingBalance = prevStatement
    ? parseFloat(prevStatement.ClosingBalance)
    : 0.0;

  // 2. Calculate Total Charges (Sum of PatientPortion for invoices dated within the month)
  const chargesResult = await db.Invoice.findOne({
    attributes: [
      [
        db.sequelize.fn("SUM", db.sequelize.col("PatientPortion")),
        "totalCharges",
      ],
    ],
    where: {
      PatientId: patientId,
      InvoiceDate: { [Op.between]: [startDate, endDate] },
    },
    raw: true,
  });
  const totalCharges = parseFloat(chargesResult.totalCharges || 0);

  // 3. Calculate Total Payments (Sum of payments dated within the month)
  const paymentsResult = await db.Payment.findOne({
    attributes: [
      [db.sequelize.fn("SUM", db.sequelize.col("Amount")), "totalPayments"],
    ],
    where: {
      PatientId: patientId,
      PaymentDate: { [Op.between]: [startDate, endDate] },
      TransactionStatus: "completed",
    },
    raw: true,
  });
  const totalPayments = parseFloat(paymentsResult.totalPayments || 0);

  // 4. Calculate Closing Balance
  const closingBalance = openingBalance + totalCharges - totalPayments;

  return {
    PatientId: patientId,
    StatementDate: endDate, // Use end date as statement date
    StartDate: startDate,
    EndDate: endDate,
    OpeningBalance: openingBalance.toFixed(2),
    TotalCharges: totalCharges.toFixed(2),
    TotalPayments: totalPayments.toFixed(2),
    ClosingBalance: closingBalance.toFixed(2),
  };
}

// Helper function to calculate global financial statement data for a period
async function calculateFinancialStatementData(startDate, endDate) {
  // 1. Calculate Total Revenue (Sum of Invoice.Amount for invoices IN the period)
  const revenueResult = await db.Invoice.findOne({
    attributes: [
      [db.sequelize.fn("SUM", db.sequelize.col("Amount")), "totalRevenue"],
    ],
    where: {
      InvoiceDate: { [Op.between]: [startDate, endDate] },
    },
    raw: true,
  });
  const totalRevenue = parseFloat(revenueResult.totalRevenue || 0);

  // 2. Calculate Total Insurance Payments (Sum of Invoice.InsuranceCoveredAmount for invoices IN the period)
  //    Alternatively, could sum KrollRxPrescriptionPlanAdj.PlanPays if Invoice field is unreliable
  const insuranceResult = await db.Invoice.findOne({
    attributes: [
      [
        db.sequelize.fn("SUM", db.sequelize.col("InsuranceCoveredAmount")),
        "totalInsurance",
      ],
    ],
    where: {
      InvoiceDate: { [Op.between]: [startDate, endDate] },
    },
    raw: true,
  });
  const totalInsurancePayments = parseFloat(
    insuranceResult.totalInsurance || 0
  );

  // 3. Calculate Total Patient Payments (Sum of completed Payment.Amount for payments IN the period)
  const patientPaymentsResult = await db.Payment.findOne({
    attributes: [
      [
        db.sequelize.fn("SUM", db.sequelize.col("Amount")),
        "totalPatientPayments",
      ],
    ],
    where: {
      PaymentDate: { [Op.between]: [startDate, endDate] },
      TransactionStatus: "completed",
    },
    raw: true,
  });
  const totalPatientPayments = parseFloat(
    patientPaymentsResult.totalPatientPayments || 0
  );

  // 4. Calculate Outstanding Balance (Sum of PatientPortion - AmountPaid for ALL non-paid invoices as of endDate)
  //    This is trickier - it's not just for the period, but the total outstanding *at the end* of the period.
  //    Let's calculate the sum of (PatientPortion - AmountPaid) for all invoices NOT fully paid.
  //    NOTE: This might not perfectly match a true Accounts Receivable calculation which involves aging.
  const outstandingResult = await db.Invoice.findOne({
    attributes: [
      [
        db.sequelize.fn(
          "SUM",
          db.sequelize.literal(
            "CAST(PatientPortion AS REAL) - CAST(AmountPaid AS REAL)"
          )
        ),
        "totalOutstanding",
      ],
    ],
    where: {
      // Find invoices created on or before the endDate that are not fully paid
      InvoiceDate: { [Op.lte]: endDate },
      Status: { [Op.notIn]: ["paid"] }, // Exclude fully paid invoices
      // Add other statuses to exclude if necessary (e.g., 'cancelled', 'written_off')
    },
    raw: true,
  });
  const totalOutstanding = parseFloat(outstandingResult.totalOutstanding || 0);

  return {
    StatementDate: endDate, // Use end date as statement date
    StartDate: startDate,
    EndDate: endDate,
    TotalRevenue: totalRevenue.toFixed(2),
    InsurancePayments: totalInsurancePayments.toFixed(2),
    PatientPayments: totalPatientPayments.toFixed(2),
    OutstandingBalance: totalOutstanding.toFixed(2), // Reflects balance at the END of the period
  };
}
