'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    // Create Invoice table (depends on kroll_patient and kroll_rx_prescription)
    await queryInterface.createTable("invoices", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        unique: true,
      },
      PatientId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "kroll_patient", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      RxId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: { model: "kroll_rx_prescription", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      InvoiceDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      DueDate: { type: Sequelize.DATE, allowNull: false },
      Description: { type: Sequelize.STRING, allowNull: true },
      Amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      AmountPaid: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
        allowNull: false,
      },
      InsuranceCoveredAmount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
        allowNull: false,
      },
      PatientPortion: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      Status: {
        type: Sequelize.STRING,
        defaultValue: "pending",
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // Create Payments table (depends on kroll_patient and invoices)
    await queryInterface.createTable("payments", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        unique: true,
      },
      PatientId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "kroll_patient", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      InvoiceId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "invoices", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      Amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      PaymentDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      PaymentMethod: { type: Sequelize.STRING, allowNull: false },
      ReferenceNumber: { type: Sequelize.STRING, allowNull: true },
      Notes: { type: Sequelize.TEXT, allowNull: true },
      TransactionStatus: {
        type: Sequelize.STRING,
        defaultValue: "completed",
        allowNull: false,
      },
      ExternalTransactionId: { type: Sequelize.STRING, allowNull: true },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // Create MonthlyStatement table (depends on kroll_patient)
    await queryInterface.createTable("monthly_statements", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        unique: true,
      },
      PatientId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "kroll_patient", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      StatementDate: { type: Sequelize.DATE, allowNull: false },
      StartDate: { type: Sequelize.DATE, allowNull: false },
      EndDate: { type: Sequelize.DATE, allowNull: false },
      OpeningBalance: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      TotalCharges: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      TotalPayments: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      ClosingBalance: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      // No updatedAt in model definition
    });

    // Create FinancialStatement table (no dependencies on other new tables)
    await queryInterface.createTable("financial_statements", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        unique: true,
      },
      StatementDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      StartDate: { type: Sequelize.DATE, allowNull: false },
      EndDate: { type: Sequelize.DATE, allowNull: false },
      TotalRevenue: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      InsurancePayments: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      PatientPayments: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      OutstandingBalance: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      // updatedAt is disabled in the model for this table
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    // Drop tables in reverse order of creation
    await queryInterface.dropTable("financial_statements");
    await queryInterface.dropTable("monthly_statements");
    await queryInterface.dropTable("payments");
    await queryInterface.dropTable("invoices");
  }
};
