const db = require("../models");
const { MonthlyStatement, FinancialStatement, Invoice, Payment } = db;
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
          // EndDate: {
          //   [Op.between]: [startOfMonthDate, endOfMonthDate],
          // },
          StartDate: startOfMonthDate, // Query by StartDate instead
        };
        periodStr = `${month}/${targetYear}`;
      }
    } else if (startDate) {
      const parsedStartDate = parseISO(startDate);
      if (isValid(parsedStartDate)) {
        // Check if date is valid
        const startOfMonthDate = startOfMonth(parsedStartDate);
        // const endOfMonthDate = endOfMonth(startOfMonthDate); // Not needed for query
        whereClause = {
          // EndDate: {
          //   [Op.between]: [startOfMonthDate, endOfMonthDate],
          // },
          StartDate: startOfMonthDate, // Query by StartDate
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

    console.log(`Fetching stored monthly statements for Patient ${patientId}`);

    // Read directly from the MonthlyStatement table
    const statements = await MonthlyStatement.findAll({
      where: { PatientId: patientId },
      order: [["StartDate", "DESC"]], // Order by period start date, newest first
      limit: 12, // Optionally limit to the last 12 stored statements
    });

    if (!statements || statements.length === 0) {
      console.log(
        `No stored monthly statements found for Patient ${patientId}.`
      );
      // Return empty array or 404 based on preference
      // return res.status(404).json({ message: "No monthly statements found for this patient." });
    }

    res.status(200).json(statements); // Return the stored statements
  } catch (error) {
    console.error(
      "Error fetching stored monthly statements for patient:",
      error
    );
    res.status(500).json({
      message: "Error fetching monthly statements",
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
async function calculateStatementData(
  patientId,
  startDate,
  endDate,
  transaction = null
) {
  // 1. Calculate Opening Balance dynamically
  const priorChargesResult = await Invoice.findOne({
    attributes: [
      [
        db.sequelize.fn("SUM", db.sequelize.col("PatientPortion")),
        "totalPriorCharges",
      ],
    ],
    where: {
      PatientId: patientId,
      InvoiceDate: { [Op.lt]: startDate }, // Invoices dated *before* the start date
    },
    raw: true,
    transaction, // Pass transaction
  });
  const totalPriorCharges = parseFloat(
    priorChargesResult?.totalPriorCharges || 0
  );

  const priorPaymentRecords = await Payment.findAll({
    attributes: ["Amount", "isRefund"],
    where: {
      PatientId: patientId,
      PaymentDate: { [Op.lt]: startDate }, // Payments dated *before* the start date
      TransactionStatus: "completed",
    },
    raw: true,
    transaction, // Pass transaction
  });
  const totalPriorPayments = priorPaymentRecords.reduce((sum, p) => {
    const paymentAmount = parseFloat(p.Amount || 0);
    return sum + (p.isRefund ? -paymentAmount : paymentAmount);
  }, 0);

  const openingBalance = totalPriorCharges - totalPriorPayments;

  // 2. Calculate Total Charges (Sum of PatientPortion for invoices dated within the month)
  const chargesResult = await Invoice.findOne({
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
    transaction, // Pass transaction
  });
  const totalCharges = parseFloat(chargesResult?.totalCharges || 0);

  // 3. Calculate Total Payments (Sum of payments - refunds dated within the month)
  const paymentRecords = await Payment.findAll({
    attributes: ["Amount", "isRefund"],
    where: {
      PatientId: patientId,
      PaymentDate: { [Op.between]: [startDate, endDate] },
      TransactionStatus: "completed",
    },
    raw: true,
    transaction, // Pass transaction
  });
  const totalPayments = paymentRecords.reduce((sum, p) => {
    const paymentAmount = parseFloat(p.Amount || 0);
    return sum + (p.isRefund ? -paymentAmount : paymentAmount);
  }, 0);

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
    // Ensure createdAt/updatedAt are handled by Sequelize defaults or excluded here
    // if they are part of the returned object unintentionally.
  };
}

// Helper function to calculate and upsert monthly statement data for a patient and period
// This function will be EXPORTED
async function updateMonthlyStatementForMonth(
  patientId,
  year,
  month,
  transaction
) {
  if (
    isNaN(patientId) ||
    isNaN(year) ||
    isNaN(month) ||
    month < 1 ||
    month > 12
  ) {
    console.error(
      `Invalid patientId (${patientId}), year (${year}), or month (${month}) for monthly statement update.`
    );
    // Decide if we should throw or just return to avoid breaking the transaction
    // For now, just log and return. Throw error if this should halt the process.
    // throw new Error('Invalid input for updateMonthlyStatementForMonth');
    return;
  }

  const startDate = startOfMonth(new Date(year, month - 1, 1));
  const endDate = endOfMonth(startDate);

  console.log(
    `Updating monthly statement for Patient ${patientId} - ${format(
      startDate,
      "yyyy-MM"
    )}`
  );

  try {
    // Pass the transaction to the calculation function
    const statementData = await calculateStatementData(
      patientId,
      startDate,
      endDate,
      transaction
    );

    // Perform an Upsert operation within the transaction
    // Find existing or build new is safer than relying purely on upsert PK behavior across DBs
    let [statement, created] = await MonthlyStatement.findOrCreate({
      where: {
        PatientId: patientId,
        StartDate: startDate,
        // EndDate: endDate, // Using StartDate as the unique key for the period is safer
      },
      defaults: {
        // Provide defaults without PK or potentially conflicting fields like id/createdAt
        PatientId: statementData.PatientId,
        StatementDate: statementData.StatementDate,
        StartDate: statementData.StartDate,
        EndDate: statementData.EndDate,
        OpeningBalance: statementData.OpeningBalance,
        TotalCharges: statementData.TotalCharges,
        TotalPayments: statementData.TotalPayments,
        ClosingBalance: statementData.ClosingBalance,
      },
      transaction: transaction,
    });

    if (!created) {
      // If it existed, update it with the latest calculated data, excluding PK/timestamps
      await statement.update(
        {
          OpeningBalance: statementData.OpeningBalance,
          TotalCharges: statementData.TotalCharges,
          TotalPayments: statementData.TotalPayments,
          ClosingBalance: statementData.ClosingBalance,
          StatementDate: statementData.StatementDate, // Update statement date too if needed
          EndDate: statementData.EndDate, // Ensure EndDate is also updated
        },
        { transaction: transaction }
      );
      console.log(
        `Updated existing monthly statement for Patient ${patientId} - ${format(
          startDate,
          "yyyy-MM"
        )}`
      );
    } else {
      console.log(
        `Created new monthly statement for Patient ${patientId} - ${format(
          startDate,
          "yyyy-MM"
        )}`
      );
    }
  } catch (error) {
    console.error(
      `Error calculating/upserting monthly statement for Patient ${patientId} (${year}-${month}):`,
      error
    );
    // Re-throw the error to ensure the transaction is rolled back
    throw error;
  }
}

// Helper function to calculate global financial statement data for a period
async function calculateFinancialStatementData(startDate, endDate) {
  const revenueResult = await db.Invoice.findOne({
    attributes: [
      [db.sequelize.fn("SUM", db.sequelize.col("Amount")), "totalRevenue"],
    ],
    where: {
      InvoiceDate: { [Op.between]: [startDate, endDate] },
    },
    raw: true,
  });
  const totalRevenue = parseFloat(revenueResult?.totalRevenue || 0); // Use optional chaining

  // 2. Calculate Total Insurance Payments
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
    insuranceResult?.totalInsurance || 0 // Use optional chaining
  );

  // 3. Calculate Total Patient Payments (Net Refunds) IN the period
  const patientPaymentsRecords = await db.Payment.findAll({
    attributes: ["Amount", "isRefund"],
    where: {
      PaymentDate: { [Op.between]: [startDate, endDate] },
      TransactionStatus: "completed",
    },
    raw: true,
  });
  const totalPatientPayments = patientPaymentsRecords.reduce((sum, p) => {
    const paymentAmount = parseFloat(p.Amount || 0);
    return sum + (p.isRefund ? -paymentAmount : paymentAmount);
  }, 0);

  // 4. Calculate Outstanding Balance as of endDate
  const outstandingResult = await db.Invoice.findOne({
    attributes: [
      [
        db.sequelize.fn(
          "SUM",
          // Ensure correct casting for subtraction across different DB types
          db.sequelize.literal(
            "CAST(COALESCE(PatientPortion, 0) AS DECIMAL(10,2)) - CAST(COALESCE(AmountPaid, 0) AS DECIMAL(10,2))"
          )
        ),
        "totalOutstanding",
      ],
    ],
    where: {
      InvoiceDate: { [Op.lte]: endDate },
      Status: { [Op.notIn]: ["paid"] },
    },
    raw: true,
  });
  // Ensure outstanding is not negative
  const totalOutstanding = Math.max(
    0,
    parseFloat(outstandingResult?.totalOutstanding || 0)
  );

  return {
    StatementDate: endDate,
    StartDate: startDate,
    EndDate: endDate,
    TotalRevenue: totalRevenue.toFixed(2),
    InsurancePayments: totalInsurancePayments.toFixed(2),
    PatientPayments: totalPatientPayments.toFixed(2),
    OutstandingBalance: totalOutstanding.toFixed(2),
  };
}

// Export the new helper function
module.exports.updateMonthlyStatementForMonth = updateMonthlyStatementForMonth;
