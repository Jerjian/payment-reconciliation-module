require("dotenv").config(); // Load environment variables from .env file
const express = require("express");
const cors = require("cors"); // Import cors package

// Import database models (Sequelize)
const db = require("./models"); // Assumes index.js in models directory

const app = express();
const PORT = process.env.PORT || 3001; // Use port from .env or default to 3001

// Middleware to parse JSON bodies
app.use(express.json());

// Enable CORS for all origins (adjust origins for production)
app.use(cors());

// Import Routes
const patientRoutes = require("./routes/patientRoutes");
const paymentRoutes = require("./routes/paymentRoutes"); // Import payment routes
const statementRoutes = require("./routes/statementRoutes"); // Import statement routes
// TODO: Import other routes (e.g., invoiceRoutes) when created

// Basic Route for testing
app.get("/", (req, res) => {
  res.send("Payment Reconciliation API is running!");
});

// Use API routes
app.use("/api/patients", patientRoutes);
app.use("/api/payments", paymentRoutes); // Use payment routes
app.use("/api/statements", statementRoutes); // Use statement routes
// TODO: Add other API routes here (e.g., app.use('/api/invoices', invoiceRoutes);)

// Start the server after connecting to the database
db.sequelize
  .authenticate()
  .then(() => {
    console.log("Database connection has been established successfully.");
    app.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
    process.exit(1); // Exit if database connection fails
  });

module.exports = app; // Export for potential testing
