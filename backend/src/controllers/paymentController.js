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
  } = req.body;

  // Basic Validation
  if (!invoiceId || !amount || !paymentDate || !paymentMethod) {
    return res.status(400).json({
      message:
        "Missing required payment fields: invoiceId, amount, paymentDate, paymentMethod.",
    });
  }
  if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
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
        Amount: amount,
        PaymentDate: paymentDate,
        PaymentMethod: paymentMethod,
        ReferenceNumber: referenceNumber, // Optional
        Notes: notes, // Optional
        TransactionStatus: "completed", // Assuming direct manual entries are completed
      },
      { transaction }
    );

    // 3. Update Invoice AmountPaid and Status
    // Sum all completed payments for this invoice *within the transaction*
    const paymentSumResult = await Payment.findOne({
      attributes: [
        [db.sequelize.fn("SUM", db.sequelize.col("Amount")), "totalPaid"],
      ],
      where: {
        InvoiceId: invoiceId,
        TransactionStatus: "completed", // Only sum completed payments
      },
      raw: true, // Get plain data object
      transaction, // Include in the transaction for consistency
    });

    const totalPaid = parseFloat(paymentSumResult.totalPaid || 0);
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
