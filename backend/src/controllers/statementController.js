const db = require("../models");
const { MonthlyStatement, FinancialStatement } = db;
const { Op } = require("sequelize");
const {
  startOfMonth,
  endOfMonth,
  parseISO,
  subMonths,
  format,
  isValid,
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

// Get Financial Statements (Reads from table based on query params)
exports.getFinancialStatements = async (req, res) => {
  try {
    let whereClause = {};
    const { year, month, startDate } = req.query; // Accept year/month or startDate
    let periodStr = "the requested period";

    if (year && month) {
      const targetMonth = parseInt(month, 10);
      const targetYear = parseInt(year, 10);
      if (
        !isNaN(targetYear) &&
        !isNaN(targetMonth) &&
        targetMonth >= 1 &&
        targetMonth <= 12
      ) {
        const startOfMonthDate = new Date(targetYear, targetMonth - 1, 1);
        const endOfMonthDate = endOfMonth(startOfMonthDate);
        // Query based on statement's EndDate falling within the month
        whereClause = {
          EndDate: {
            [Op.between]: [startOfMonthDate, endOfMonthDate],
          },
        };
        periodStr = `${month}/${targetYear}`;
      }
    } else if (startDate) {
      const parsedStartDate = parseISO(startDate);
      if (isValid(parsedStartDate)) {
        // Check if date is valid
        const startOfMonthDate = startOfMonth(parsedStartDate);
        const endOfMonthDate = endOfMonth(startOfMonthDate);
        whereClause = {
          EndDate: {
            [Op.between]: [startOfMonthDate, endOfMonthDate],
          },
        };
        periodStr = `the month starting ${format(
          startOfMonthDate,
          "yyyy-MM-dd"
        )}`;
      }
    } else {
      // If no specific period, find the latest statement
      periodStr = "the latest available period";
    }

    // Find the statement matching the criteria, or the latest if no criteria
    const statement = await FinancialStatement.findOne({
      where: whereClause,
      order: [["StatementDate", "DESC"]], // Get the latest matching one / overall latest
    });

    if (!statement) {
      return res.status(404).json({
        message: `No financial statement found for ${periodStr}.`,
        // Optionally return default zero object if preferred over 404
        // StatementDate: null, StartDate: null, EndDate: null,
        // TotalRevenue: "0.00", InsurancePayments: "0.00",
        // PatientPayments: "0.00", OutstandingBalance: "0.00"
      });
    }

    res.status(200).json(statement);
  } catch (error) {
    console.error("Error fetching financial statements from table:", error);
    res.status(500).json({
      message: "Error fetching financial statements",
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
