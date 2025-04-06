"use strict";
module.exports = (sequelize, DataTypes) => {
  const KrollPatientPhone = sequelize.define(
    "KrollPatientPhone",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        unique: true,
      },
      PatID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "kroll_patient", // Corrected table name if using snake_case
          key: "id",
        },
        field: "PatID", // Explicitly map if column name differs from model key
      },
      Description: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      Phone: {
        type: DataTypes.STRING(14),
        allowNull: false,
      },
      Extension: {
        type: DataTypes.STRING(8),
        allowNull: true,
      },
      LongDistance: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      Type: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        defaultValue: 0,
      },
      status: {
        type: DataTypes.ENUM("active", "inactive"),
        allowNull: true,
      },
      DateCreated: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false, // Assuming creation date is mandatory
      },
      DateChanged: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        // Sequelize automatically handles updatedAt if timestamps: true
        allowNull: false, // Assuming change date is mandatory
      },
    },
    {
      tableName: "kroll_patient_phone",
      timestamps: true, // Enable createdAt and updatedAt
      createdAt: "DateCreated", // Map createdAt to DateCreated
      updatedAt: "DateChanged", // Map updatedAt to DateChanged
      // underscored: true // Optional: if you want Sequelize to auto-convert camelCase to snake_case for DB interactions
    }
  );

  KrollPatientPhone.associate = (models) => {
    KrollPatientPhone.belongsTo(models.KrollPatient, {
      foreignKey: "PatID", // The foreign key in KrollPatientPhone table
      as: "patient",
    });
  };

  return KrollPatientPhone;
};
