"use strict";
module.exports = (sequelize, DataTypes) => {
  const KrollPatientCom = sequelize.define(
    "KrollPatientCom",
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
          model: "kroll_patient", // Name of the target model table
          key: "id",
        },
        field: "PatID", // Explicitly map
      },
      Topic: {
        type: DataTypes.STRING(15),
        allowNull: true,
      },
      Created: {
        type: DataTypes.DATE,
        allowNull: true,
        // Map to 'createdAt' if using Sequelize timestamps
      },
      Changed: {
        type: DataTypes.DATE,
        allowNull: true,
        // Map to 'updatedAt' if using Sequelize timestamps
      },
      Comment: {
        type: DataTypes.BLOB, // Use BLOB for LargeBinary/varbinary(max)
        allowNull: true,
      },
      ShowOnRx: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      PrintOnHardcopy: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      Conspicuous: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      CeRxRoot: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      CeRxExtension: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      CreatedFromNetwork: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      WorkflowAlerts: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      CommentPlainText: {
        type: DataTypes.TEXT, // Use TEXT for varchar(max)
        allowNull: true,
      },
      // Sequelize handles createdAt and updatedAt automatically if timestamps: true
      // Map 'Created' and 'Changed' if needed, or rely on standard timestamps
    },
    {
      tableName: "kroll_patient_com",
      timestamps: true, // Enable createdAt and updatedAt
      // Map Sequelize timestamps to your column names if they differ
      // createdAt: 'Created',
      // updatedAt: 'Changed',
      // underscored: true // Optional: auto-convert camelCase to snake_case
    }
  );

  KrollPatientCom.associate = (models) => {
    KrollPatientCom.belongsTo(models.KrollPatient, {
      foreignKey: "PatID",
      as: "patient",
    });
  };

  return KrollPatientCom;
};
