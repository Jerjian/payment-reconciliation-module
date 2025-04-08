const db = require("../models");
const { Payment, Invoice } = db;
const { Op } = require("sequelize"); // Import Op for summation

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
  const absAmount = Math.abs(parseFloat(amount));
  if (isNaN(absAmount) || absAmount <= 0) {
    return res.status(400).json({ message: "Invalid amount format or value." });
  }

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
    isRefund === undefined
  ) {
    return res.status(400).json({ message: "No update fields provided." });
  }
  // Validate amount if provided
  let absAmount;
  if (amount !== undefined) {
    absAmount = Math.abs(parseFloat(amount));
    if (isNaN(absAmount) || absAmount <= 0) {
      return res
        .status(400)
        .json({ message: "Invalid amount format or value." });
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

    // Store the original invoiceId before potential update
    const originalInvoiceId = payment.InvoiceId;

    // 2. Update the Payment record fields selectively
    if (absAmount !== undefined) payment.Amount = absAmount;
    if (paymentDate !== undefined) payment.PaymentDate = paymentDate;
    if (paymentMethod !== undefined) payment.PaymentMethod = paymentMethod;
    if (referenceNumber !== undefined)
      payment.ReferenceNumber = referenceNumber; // Allow setting to null/empty
    if (notes !== undefined) payment.Notes = notes; // Allow setting to null/empty
    if (isRefund !== undefined) payment.isRefund = !!isRefund;
    // Note: We generally don't allow changing InvoiceId or PatientId via update

    await payment.save({ transaction }); // Save the changes to the payment record

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

    await Invoice.update(
      { AmountPaid: totalPaid.toFixed(2), Status: newStatus },
      { where: { id: originalInvoiceId }, transaction }
    );

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

    // 2. Delete the Payment record
    await payment.destroy({ transaction });

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

    await Invoice.update(
      { AmountPaid: totalPaid.toFixed(2), Status: newStatus },
      { where: { id: invoiceIdToDeleteFrom }, transaction }
    );

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
