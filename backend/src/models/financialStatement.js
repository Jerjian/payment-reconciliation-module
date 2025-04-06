'use strict';
module.exports = (sequelize, DataTypes) => {
  const FinancialStatement = sequelize.define('FinancialStatement', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      unique: true,
    },
    StatementDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    StartDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    EndDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    TotalRevenue: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    InsurancePayments: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    PatientPayments: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    OutstandingBalance: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    // Sequelize handles createdAt automatically if timestamps: true
    // No 'updatedAt' in the original SQLAlchemy
  }, {
    tableName: 'financial_statements',
    timestamps: true, // Enable createdAt, ignore updatedAt or set timestamps: { createdAt: true, updatedAt: false }
    createdAt: 'createdAt', // Explicitly map to the default field name
    updatedAt: false, // Disable updatedAt if not needed
    // underscored: true // Optional
  });

  // No associations defined in the SQLAlchemy model for FinancialStatement
  // FinancialStatement.associate = (models) => {
    // Define associations here if needed in the future
  // };

  return FinancialStatement;
}; 