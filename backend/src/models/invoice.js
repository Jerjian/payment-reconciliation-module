module.exports = (sequelize, DataTypes) => {
  const Invoice = sequelize.define(
    "Invoice",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      PatientId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "KrollPatient",
          key: "id",
        },
      },
      RxId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: "KrollRxPrescription",
          key: "id",
        },
      },
      InvoiceDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      DueDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      Description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      Amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      AmountPaid: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      InsuranceCoveredAmount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      PatientPortion: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      Status: {
        type: DataTypes.STRING,
        defaultValue: "pending",
      },
    },
    {
      tableName: "invoices",
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    }
  );

  Invoice.associate = (models) => {
    Invoice.belongsTo(models.KrollPatient, {
      foreignKey: "PatientId",
      as: "patient",
    });

    Invoice.belongsTo(models.KrollRxPrescription, {
      foreignKey: "RxId",
      as: "prescription",
    });

    Invoice.hasMany(models.Payment, {
      foreignKey: "InvoiceId",
      as: "payments",
    });
  };

  return Invoice;
};
