"use strict";
module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define(
    "Payment",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        unique: true,
      },
      PatientId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "kroll_patient", // Ensure this matches the KrollPatient table name
          key: "id",
        },
        field: "PatientId", // Explicit map
      },
      InvoiceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "invoices",
          key: "id",
        },
        field: "InvoiceId", // Explicit map
      },
      Amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      PaymentDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      PaymentMethod: {
        type: DataTypes.STRING,
        allowNull: false,
        // Consider using ENUM if methods are fixed: ENUM('credit', 'check', 'direct_deposit')
      },
      ReferenceNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      Notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      TransactionStatus: {
        type: DataTypes.STRING,
        allowNull: false, // Assuming status is required
        defaultValue: "completed",
        // Consider ENUM: ENUM('pending', 'completed', 'failed')
      },
      ExternalTransactionId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      // Sequelize handles createdAt and updatedAt automatically if timestamps: true
    },
    {
      tableName: "payments",
      timestamps: true, // Enable createdAt and updatedAt
      // underscored: true // Optional
    }
  );

  Payment.associate = (models) => {
    Payment.belongsTo(models.KrollPatient, {
      foreignKey: "PatientId",
      as: "patient",
    });
    Payment.belongsTo(models.Invoice, {
      foreignKey: "InvoiceId",
      as: "invoice",
    });
  };

  return Payment;
};
