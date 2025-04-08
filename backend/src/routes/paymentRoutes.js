const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

// POST /api/payments - Create a new payment
router.post("/", paymentController.createPayment); // POST /api/payments

// PUT /api/payments/:paymentId - Update an existing payment
router.put("/:paymentId", paymentController.updatePayment);

// DELETE /api/payments/:paymentId - Delete a payment
router.delete("/:paymentId", paymentController.deletePayment);

// TODO: Add other payment-related routes if needed (e.g., get payment by ID)

module.exports = router;
