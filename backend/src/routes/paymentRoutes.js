const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

// POST /api/payments - Create a new payment
router.post("/", paymentController.createPayment);

// TODO: Add other payment-related routes if needed (e.g., get payment by ID, update, delete)

module.exports = router;
