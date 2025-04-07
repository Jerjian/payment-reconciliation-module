const db = require("../models");
const { Payment, Invoice } = db;

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
    return res
      .status(400)
      .json({
        message:
          "Missing required payment fields: invoiceId, amount, paymentDate, paymentMethod.",
      });
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

    // 3. OPTIONAL BUT RECOMMENDED: Update the Invoice's AmountPaid
    // It's often better to calculate AmountPaid on the fly when reading,
    // but if you have a denormalized AmountPaid field, update it here.
    // If your Invoice model has AmountPaid, uncomment and adjust:
    /*
    const newAmountPaid = parseFloat(invoice.AmountPaid || 0) + parseFloat(amount);
    await Invoice.update(
        { AmountPaid: newAmountPaid.toFixed(2) },
        { where: { id: invoiceId }, transaction }
    );
    */

    // TODO: Potentially update Invoice status (e.g., to 'paid' or 'partially_paid')
    // based on the new payment and patient portion.
    // This requires fetching all payments for the invoice again to be accurate.

    await transaction.commit(); // Commit the transaction

    res.status(201).json(newPayment);
  } catch (error) {
    await transaction.rollback(); // Rollback on error
    console.error("Error creating payment:", error);
    res
      .status(500)
      .json({ message: "Error creating payment", error: error.message });
  }
};
