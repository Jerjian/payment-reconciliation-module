const db = require("../models");
const { Payment, Invoice, FinancialStatement, MonthlyStatement } = db;
const { Op } = require("sequelize"); // Import Op for summation
const { startOfMonth, endOfMonth, parseISO, isValid } = require("date-fns"); // Add date-fns
const { updateMonthlyStatementForMonth } = require("./statementController"); // Import the helper

// Helper function to update financial statement for a given month
// (Copied and adapted from statementController - needs transaction param)
async function updateFinancialStatementForMonth(year, month, transaction) {
  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    console.error(
      `Invalid year (${year}) or month (${month}) provided for financial statement update.`
    );
    return; // Or throw an error
  }
  const startDate = new Date(year, month - 1, 1);
  const endDate = endOfMonth(startDate);

  try {
    // Use the calculation logic (similar to the controller helper)
    const revenueResult = await Invoice.findOne({
      attributes: [
        [db.sequelize.fn("SUM", db.sequelize.col("Amount")), "totalRevenue"],
      ],
      where: { InvoiceDate: { [Op.between]: [startDate, endDate] } },
      transaction,
      raw: true,
    });
    const insuranceResult = await Invoice.findOne({
      attributes: [
        [
          db.sequelize.fn("SUM", db.sequelize.col("InsuranceCoveredAmount")),
          "totalInsurance",
        ],
      ],
      where: { InvoiceDate: { [Op.between]: [startDate, endDate] } },
      transaction,
      raw: true,
    });
    // Sum payments considering refunds within the period
    const paymentSumResult = await Payment.findAll({
      attributes: ["Amount", "isRefund"],
      where: {
        PaymentDate: { [Op.between]: [startDate, endDate] },
        TransactionStatus: "completed",
      },
      raw: true,
      transaction,
    });
    const totalPatientPayments = paymentSumResult.reduce((sum, p) => {
      const paymentAmount = parseFloat(p.Amount || 0);
      return sum + (p.isRefund ? -paymentAmount : paymentAmount);
    }, 0);

    // Outstanding balance calculation (Simplified: total patient portion minus total paid for invoices *up to* end date)
    const outstandingResult = await Invoice.findOne({
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
        InvoiceDate: { [Op.lte]: endDate }, // Invoices up to the end of the month
        Status: { [Op.notIn]: ["paid"] }, // Not fully paid
      },
      transaction,
      raw: true,
    });
    // Ensure outstanding balance isn't negative
    const totalOutstanding = Math.max(
      0,
      parseFloat(outstandingResult?.totalOutstanding || 0)
    );

    const statementData = {
      StatementDate: endDate,
      StartDate: startDate,
      EndDate: endDate,
      TotalRevenue: parseFloat(revenueResult?.totalRevenue || 0).toFixed(2),
      InsurancePayments: parseFloat(
        insuranceResult?.totalInsurance || 0
      ).toFixed(2),
      PatientPayments: totalPatientPayments.toFixed(2),
      OutstandingBalance: totalOutstanding.toFixed(2), // Use calculated non-negative outstanding
    };

    // Upsert the record for the month
    // Find existing or build new - necessary because upsert might not work perfectly across dialects or without PK
    let existingStatement = await FinancialStatement.findOne({
      where: {
        StartDate: startDate,
        EndDate: endDate,
      },
      transaction,
    });

    if (existingStatement) {
      // Only update if data has changed (optional optimization)
      if (
        JSON.stringify(existingStatement.get({ plain: true })) !==
        JSON.stringify({
          ...statementData,
          id: existingStatement.id,
          createdAt: existingStatement.createdAt,
        })
      ) {
        await FinancialStatement.update(statementData, {
          where: { id: existingStatement.id },
          transaction,
        });
        console.log(`Updated global financial statement for ${month}/${year}`);
      } else {
        console.log(
          `No changes detected for global financial statement ${month}/${year}. Skipping update.`
        );
      }
    } else {
      await FinancialStatement.create(statementData, { transaction });
      console.log(`Created global financial statement for ${month}/${year}`);
    }
  } catch (error) {
    console.error(
      `Error calculating/upserting global financial statement for ${month}/${year}:`,
      error
    );
    throw error; // Re-throw to ensure transaction rollback
  }
}

// Create a new payment record
exports.createPayment = async (req, res) => {
  const {
    invoiceId,
    amount,
    paymentDate,
    paymentMethod,
    referenceNumber,
    notes,
    isRefund,
  } = req.body;

  // Basic Validation
  if (!invoiceId || !amount || !paymentDate || !paymentMethod) {
    return res.status(400).json({
      message:
        "Missing required payment fields: invoiceId, amount, paymentDate, paymentMethod.",
    });
  }
  // Parse amount and ensure it's a positive number
  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    // Check if not a number OR less than or equal to zero
    return res.status(400).json({
      message: "Invalid amount format or value. Amount must be positive.",
    });
  }

  const absAmount = Math.abs(parsedAmount); // Store absolute amount for use

  const transaction = await db.sequelize.transaction(); // Start a transaction

  try {
    // 1. Verify the Invoice exists and potentially get its details
    const invoice = await Invoice.findByPk(invoiceId, { transaction });
    if (!invoice) {
      await transaction.rollback();
      return res
        .status(404)
        .json({ message: `Invoice with ID ${invoiceId} not found.` });
    }
    const patientId = invoice.PatientId; // Get patient ID

    // 2. Create the Payment record
    const newPayment = await Payment.create(
      {
        InvoiceId: invoiceId,
        PatientId: invoice.PatientId, // Get PatientId from the associated invoice
        Amount: absAmount,
        PaymentDate: paymentDate,
        PaymentMethod: paymentMethod,
        ReferenceNumber: referenceNumber, // Optional
        Notes: notes, // Optional
        TransactionStatus: "completed", // Assuming direct manual entries are completed
        isRefund: !!isRefund,
      },
      { transaction }
    );

    // 3. Update Invoice AmountPaid and Status
    // Sum payments considering refunds
    const paymentSumResult = await Payment.findAll({
      attributes: ["Amount", "isRefund"],
      where: {
        InvoiceId: invoiceId,
        TransactionStatus: "completed",
      },
      raw: true,
      transaction,
    });

    // Calculate net amount paid (payments - refunds)
    const totalPaid = paymentSumResult.reduce((sum, p) => {
      const paymentAmount = parseFloat(p.Amount || 0);
      return sum + (p.isRefund ? -paymentAmount : paymentAmount);
    }, 0);

    const patientPortion = parseFloat(invoice.PatientPortion);
    let newStatus = invoice.Status;

    if (totalPaid >= patientPortion) {
      newStatus = "paid";
    } else if (totalPaid > 0) {
      newStatus = "partially_paid";
    } else {
      newStatus = "pending";
    }
    // TODO: Add logic for 'overdue' status based on DueDate if needed

    await Invoice.update(
      { AmountPaid: totalPaid.toFixed(2), Status: newStatus },
      { where: { id: invoiceId }, transaction }
    );

    // 4. Update Financial Statement for the payment month
    const paymentDateObj = new Date(paymentDate);
    const paymentYear = paymentDateObj.getFullYear();
    const paymentMonth = paymentDateObj.getMonth() + 1; // getMonth() is 0-indexed
    await updateFinancialStatementForMonth(
      paymentYear,
      paymentMonth,
      transaction
    );

    // 5. Update all subsequent Global Financial Statements within the same transaction
    try {
      const paymentMonthStartForCascade = startOfMonth(paymentDateObj);

      // Find subsequent financial statements within the same transaction
      const subsequentStatements = await FinancialStatement.findAll({
        where: {
          StartDate: { [Op.gt]: paymentMonthStartForCascade },
        },
        order: [["StartDate", "ASC"]], // Process in order
        transaction,
      });

      console.log(
        `Found ${subsequentStatements.length} subsequent global statements to update.`
      );

      // Recalculate each subsequent statement
      for (const statement of subsequentStatements) {
        const statementYear = statement.StartDate.getFullYear();
        const statementMonth = statement.StartDate.getMonth() + 1;
        console.log(
          `Updating subsequent global statement for ${statementMonth}/${statementYear}`
        );
        // Pass the existing transaction
        await updateFinancialStatementForMonth(
          statementYear,
          statementMonth,
          transaction
        );
      }
    } catch (cascadeError) {
      console.error(
        "Error during subsequent global financial statement updates:",
        cascadeError
      );
      // Let the main error handler catch and rollback
      throw cascadeError;
    }

    // --- NEW: Update Patient Monthly Statement ---
    console.log(
      `Triggering monthly statement update for patient ${patientId} due to new payment.`
    );
    await updateMonthlyStatementForMonth(
      patientId,
      paymentYear,
      paymentMonth,
      transaction
    );

    // --- NEW: Cascade Update for Patient's Subsequent Monthly Statements ---
    try {
      const paymentMonthStartForCascade = startOfMonth(paymentDateObj);
      const subsequentPatientStatements = await MonthlyStatement.findAll({
        where: {
          PatientId: patientId, // Specific to this patient
          StartDate: { [Op.gt]: paymentMonthStartForCascade },
        },
        order: [["StartDate", "ASC"]],
        transaction,
      });
      console.log(
        `Found ${subsequentPatientStatements.length} subsequent monthly statements for patient ${patientId} to update.`
      );
      for (const statement of subsequentPatientStatements) {
        const statementYear = statement.StartDate.getFullYear();
        const statementMonth = statement.StartDate.getMonth() + 1;
        console.log(
          `Updating subsequent monthly statement for patient ${patientId} - ${statementMonth}/${statementYear}`
        );
        await updateMonthlyStatementForMonth(
          patientId,
          statementYear,
          statementMonth,
          transaction
        );
      }
    } catch (cascadeError) {
      console.error(
        `Error during subsequent patient monthly statement updates (create):`,
        cascadeError
      );
      throw cascadeError; // Ensure transaction rollback
    }

    await transaction.commit(); // Commit the transaction

    // Fetch the newly created payment again *outside* the transaction to return fresh data
    // (Alternatively, return the data from `newPayment` if it's sufficient)
    const createdPayment = await Payment.findByPk(newPayment.id);

    res.status(201).json(createdPayment);
  } catch (error) {
    await transaction.rollback(); // Rollback on error
    console.error("Error creating payment:", error);
    res
      .status(500)
      .json({ message: "Error creating payment", error: error.message });
  }
};

// Update an existing payment record
exports.updatePayment = async (req, res) => {
  const paymentId = parseInt(req.params.paymentId, 10);
  const {
    amount,
    paymentDate,
    paymentMethod,
    referenceNumber,
    notes,
    isRefund,
  } = req.body;

  // Basic Validation
  if (isNaN(paymentId)) {
    return res.status(400).json({ message: "Invalid payment ID format." });
  }
  // Validate required fields for update (can be less strict than create if needed)
  if (
    amount === undefined &&
    paymentDate === undefined &&
    paymentMethod === undefined &&
    referenceNumber === undefined && // include all updatable fields
    notes === undefined &&
    isRefund === undefined
  ) {
    return res.status(400).json({ message: "No update fields provided." });
  }
  // Validate amount if provided
  let absAmount;
  if (amount !== undefined) {
    absAmount = Math.abs(parseFloat(amount));
    if (isNaN(absAmount) || absAmount <= 0) {
      // Allow 0 amount conceptually, but maybe not useful? Sticking with > 0
      return res
        .status(400)
        .json({
          message: "Invalid amount format or value. Amount must be positive.",
        });
    }
  }

  const transaction = await db.sequelize.transaction(); // Start a transaction

  try {
    // 1. Find the existing Payment
    const payment = await Payment.findByPk(paymentId, { transaction });
    if (!payment) {
      await transaction.rollback();
      return res
        .status(404)
        .json({ message: `Payment with ID ${paymentId} not found.` });
    }

    // Store the original invoiceId and date before potential update
    const originalInvoiceId = payment.InvoiceId;
    const originalPaymentDate = new Date(payment.PaymentDate); // Ensure it's a Date object
    const patientId = payment.PatientId; // Get patient ID

    // 2. Update the Payment record fields selectively
    const updateData = {};
    if (absAmount !== undefined) updateData.Amount = absAmount;
    if (paymentDate !== undefined) updateData.PaymentDate = paymentDate;
    if (paymentMethod !== undefined) updateData.PaymentMethod = paymentMethod;
    if (referenceNumber !== undefined)
      updateData.ReferenceNumber = referenceNumber;
    if (notes !== undefined) updateData.Notes = notes;
    if (isRefund !== undefined) updateData.isRefund = !!isRefund;

    // Only save if there are changes
    if (Object.keys(updateData).length > 0) {
      await payment.update(updateData, { transaction }); // Use update method
      console.log(`Payment ${paymentId} updated.`);
    } else {
      console.log(
        `No changes provided for payment ${paymentId}. Skipping save.`
      );
    }

    // 3. Recalculate and Update the associated Invoice AmountPaid and Status
    // Use the originalInvoiceId to ensure we update the correct invoice
    const paymentSumResult = await Payment.findAll({
      attributes: ["Amount", "isRefund"],
      where: {
        InvoiceId: originalInvoiceId,
        TransactionStatus: "completed",
      },
      raw: true,
      transaction,
    });

    const totalPaid = paymentSumResult.reduce((sum, p) => {
      const paymentAmount = parseFloat(p.Amount || 0);
      return sum + (p.isRefund ? -paymentAmount : paymentAmount);
    }, 0);

    // Fetch the associated invoice again to get its patient portion
    const invoice = await Invoice.findByPk(originalInvoiceId, { transaction });
    if (!invoice) {
      // This shouldn't happen if the payment existed, but handle defensively
      await transaction.rollback();
      return res.status(500).json({
        message: `Could not find associated invoice ID ${originalInvoiceId}. Data might be inconsistent.`,
      });
    }

    const patientPortion = parseFloat(invoice.PatientPortion);
    let newStatus = invoice.Status;

    if (totalPaid >= patientPortion) {
      newStatus = "paid";
    } else if (totalPaid > 0) {
      newStatus = "partially_paid";
    } else {
      newStatus = "pending";
    }

    // Only update invoice if status or amount paid actually changed
    if (
      invoice.Status !== newStatus ||
      parseFloat(invoice.AmountPaid) !== totalPaid
    ) {
      await Invoice.update(
        { AmountPaid: totalPaid.toFixed(2), Status: newStatus },
        { where: { id: originalInvoiceId }, transaction }
      );
      console.log(`Invoice ${originalInvoiceId} status/amount updated.`);
    } else {
      console.log(
        `No change needed for Invoice ${originalInvoiceId} status/amount.`
      );
    }

    // 4. Update Global Financial Statements for affected months
    const newPaymentDate = new Date(payment.PaymentDate); // Use the potentially updated date
    const oldYear = originalPaymentDate.getFullYear();
    const oldMonth = originalPaymentDate.getMonth() + 1;
    const newYear = newPaymentDate.getFullYear();
    const newMonth = newPaymentDate.getMonth() + 1;

    // Update the statement for the original month
    await updateFinancialStatementForMonth(oldYear, oldMonth, transaction);
    // If the month/year changed, update the new month's statement as well
    if (oldYear !== newYear || oldMonth !== newMonth) {
      await updateFinancialStatementForMonth(newYear, newMonth, transaction);
    }

    // 5. Update all subsequent Global Financial Statements within the same transaction
    try {
      // Determine the earliest start date of the affected primary months
      const firstAffectedDate =
        originalPaymentDate < newPaymentDate
          ? originalPaymentDate
          : newPaymentDate;
      const firstAffectedMonthStart = startOfMonth(firstAffectedDate);

      // Find subsequent financial statements within the same transaction
      const subsequentStatements = await FinancialStatement.findAll({
        where: {
          StartDate: { [Op.gt]: firstAffectedMonthStart },
        },
        order: [["StartDate", "ASC"]], // Process in order
        transaction,
      });

      console.log(
        `Found ${subsequentStatements.length} subsequent global statements to update after edit.`
      );

      // Recalculate each subsequent statement
      for (const statement of subsequentStatements) {
        const statementYear = statement.StartDate.getFullYear();
        const statementMonth = statement.StartDate.getMonth() + 1;
        console.log(
          `Updating subsequent global statement for ${statementMonth}/${statementYear}`
        );
        // Pass the existing transaction
        await updateFinancialStatementForMonth(
          statementYear,
          statementMonth,
          transaction
        );
      }
    } catch (cascadeError) {
      console.error(
        "Error during subsequent global financial statement updates after edit:",
        cascadeError
      );
      // Let the main error handler catch and rollback
      throw cascadeError;
    }

    // --- NEW: Update Patient Monthly Statements ---
    console.log(
      `Triggering monthly statement update for patient ${patientId} due to payment update.`
    );
    await updateMonthlyStatementForMonth(
      patientId,
      oldYear,
      oldMonth,
      transaction
    );
    if (oldYear !== newYear || oldMonth !== newMonth) {
      await updateMonthlyStatementForMonth(
        patientId,
        newYear,
        newMonth,
        transaction
      );
    }

    // --- NEW: Cascade Update for Patient's Subsequent Monthly Statements ---
    try {
      const firstAffectedDate =
        originalPaymentDate < newPaymentDate
          ? originalPaymentDate
          : newPaymentDate;
      const firstAffectedMonthStart = startOfMonth(firstAffectedDate);
      const subsequentPatientStatements = await MonthlyStatement.findAll({
        where: {
          PatientId: patientId, // Specific to this patient
          StartDate: { [Op.gt]: firstAffectedMonthStart },
        },
        order: [["StartDate", "ASC"]],
        transaction,
      });
      console.log(
        `Found ${subsequentPatientStatements.length} subsequent monthly statements for patient ${patientId} to update after edit.`
      );
      for (const statement of subsequentPatientStatements) {
        const statementYear = statement.StartDate.getFullYear();
        const statementMonth = statement.StartDate.getMonth() + 1;
        console.log(
          `Updating subsequent monthly statement for patient ${patientId} - ${statementMonth}/${statementYear}`
        );
        await updateMonthlyStatementForMonth(
          patientId,
          statementYear,
          statementMonth,
          transaction
        );
      }
    } catch (cascadeError) {
      console.error(
        `Error during subsequent patient monthly statement updates (update):`,
        cascadeError
      );
      throw cascadeError; // Ensure transaction rollback
    }

    await transaction.commit(); // Commit the transaction

    // Fetch the updated payment record again to return the final state
    const updatedPayment = await Payment.findByPk(paymentId);

    res.status(200).json(updatedPayment);
  } catch (error) {
    await transaction.rollback(); // Rollback on error
    console.error("Error updating payment:", error);
    res
      .status(500)
      .json({ message: "Error updating payment", error: error.message });
  }
};

// Delete a payment record
exports.deletePayment = async (req, res) => {
  const paymentId = parseInt(req.params.paymentId, 10);

  // Basic Validation
  if (isNaN(paymentId)) {
    return res.status(400).json({ message: "Invalid payment ID format." });
  }

  const transaction = await db.sequelize.transaction(); // Start a transaction

  try {
    // 1. Find the existing Payment to get its InvoiceId
    const payment = await Payment.findByPk(paymentId, { transaction });
    if (!payment) {
      await transaction.rollback();
      return res
        .status(404)
        .json({ message: `Payment with ID ${paymentId} not found.` });
    }

    const invoiceIdToDeleteFrom = payment.InvoiceId; // Store the InvoiceId before deleting
    const paymentDateToDelete = new Date(payment.PaymentDate); // Store payment date as Date object
    const patientId = payment.PatientId; // Get patient ID

    // 2. Delete the Payment record
    await payment.destroy({ transaction });
    console.log(`Payment ${paymentId} deleted.`);

    // 3. Recalculate and Update the associated Invoice AmountPaid and Status
    const paymentSumResult = await Payment.findAll({
      attributes: ["Amount", "isRefund"],
      where: {
        InvoiceId: invoiceIdToDeleteFrom,
        TransactionStatus: "completed", // Only consider completed payments
      },
      raw: true,
      transaction,
    });

    const totalPaid = paymentSumResult.reduce((sum, p) => {
      const paymentAmount = parseFloat(p.Amount || 0);
      return sum + (p.isRefund ? -paymentAmount : paymentAmount);
    }, 0);

    // Fetch the associated invoice again to get its patient portion
    const invoice = await Invoice.findByPk(invoiceIdToDeleteFrom, {
      transaction,
    });
    if (!invoice) {
      // This is unlikely if the payment existed, but handle defensively
      await transaction.rollback();
      return res.status(500).json({
        message: `Could not find associated invoice ID ${invoiceIdToDeleteFrom} after deleting payment. Data might be inconsistent.`,
      });
    }

    const patientPortion = parseFloat(invoice.PatientPortion);
    let newStatus = invoice.Status;

    // Determine new status based on recalculated totalPaid
    if (totalPaid >= patientPortion) {
      newStatus = "paid";
    } else if (totalPaid > 0) {
      newStatus = "partially_paid";
    } else {
      newStatus = "pending"; // If no payments left, it's pending
    }
    // TODO: Consider 'overdue' logic if applicable

    if (
      invoice.Status !== newStatus ||
      parseFloat(invoice.AmountPaid) !== totalPaid
    ) {
      await Invoice.update(
        { AmountPaid: totalPaid.toFixed(2), Status: newStatus },
        { where: { id: invoiceIdToDeleteFrom }, transaction }
      );
      console.log(
        `Invoice ${invoiceIdToDeleteFrom} status/amount updated after delete.`
      );
    } else {
      console.log(
        `No change needed for Invoice ${invoiceIdToDeleteFrom} status/amount after delete.`
      );
    }

    // 4. Update Global Financial Statement for the payment month
    const deletedPaymentYear = paymentDateToDelete.getFullYear();
    const deletedPaymentMonth = paymentDateToDelete.getMonth() + 1;
    await updateFinancialStatementForMonth(
      deletedPaymentYear,
      deletedPaymentMonth,
      transaction
    );

    // 5. Update all subsequent Global Financial Statements within the same transaction
    try {
      const deletedPaymentMonthStart = startOfMonth(paymentDateToDelete);

      // Find subsequent financial statements within the same transaction
      const subsequentStatements = await FinancialStatement.findAll({
        where: {
          StartDate: { [Op.gt]: deletedPaymentMonthStart },
        },
        order: [["StartDate", "ASC"]], // Process in order
        transaction,
      });

      console.log(
        `Found ${subsequentStatements.length} subsequent global statements to update after delete.`
      );

      // Recalculate each subsequent statement
      for (const statement of subsequentStatements) {
        const statementYear = statement.StartDate.getFullYear();
        const statementMonth = statement.StartDate.getMonth() + 1;
        console.log(
          `Updating subsequent global statement for ${statementMonth}/${statementYear}`
        );
        // Pass the existing transaction
        await updateFinancialStatementForMonth(
          statementYear,
          statementMonth,
          transaction
        );
      }
    } catch (cascadeError) {
      console.error(
        "Error during subsequent global financial statement updates after delete:",
        cascadeError
      );
      // Let the main error handler catch and rollback
      throw cascadeError;
    }

    // --- NEW: Update Patient Monthly Statement ---
    console.log(
      `Triggering monthly statement update for patient ${patientId} due to payment deletion.`
    );
    await updateMonthlyStatementForMonth(
      patientId,
      deletedPaymentYear,
      deletedPaymentMonth,
      transaction
    );

    // --- NEW: Cascade Update for Patient's Subsequent Monthly Statements ---
    try {
      const deletedPaymentMonthStart = startOfMonth(paymentDateToDelete);
      const subsequentPatientStatements = await MonthlyStatement.findAll({
        where: {
          PatientId: patientId, // Specific to this patient
          StartDate: { [Op.gt]: deletedPaymentMonthStart },
        },
        order: [["StartDate", "ASC"]],
        transaction,
      });
      console.log(
        `Found ${subsequentPatientStatements.length} subsequent monthly statements for patient ${patientId} to update after delete.`
      );
      for (const statement of subsequentPatientStatements) {
        const statementYear = statement.StartDate.getFullYear();
        const statementMonth = statement.StartDate.getMonth() + 1;
        console.log(
          `Updating subsequent monthly statement for patient ${patientId} - ${statementMonth}/${statementYear}`
        );
        await updateMonthlyStatementForMonth(
          patientId,
          statementYear,
          statementMonth,
          transaction
        );
      }
    } catch (cascadeError) {
      console.error(
        `Error during subsequent patient monthly statement updates (delete):`,
        cascadeError
      );
      throw cascadeError; // Ensure transaction rollback
    }

    await transaction.commit(); // Commit the transaction

    res.status(204).send(); // Send No Content on successful deletion
  } catch (error) {
    await transaction.rollback(); // Rollback on error
    console.error(`Error deleting payment ID ${paymentId}:`, error);
    res
      .status(500)
      .json({ message: "Error deleting payment", error: error.message });
  }
};
