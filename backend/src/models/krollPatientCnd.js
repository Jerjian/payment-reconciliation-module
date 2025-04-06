"use strict";
module.exports = (sequelize, DataTypes) => {
  const KrollPatientCnd = sequelize.define(
    "KrollPatientCnd",
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
          model: "kroll_patient",
          key: "id",
        },
        field: "PatID", // Explicitly map
      },
      Code: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      Comment: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      Seq: {
        type: DataTypes.SMALLINT,
        allowNull: true,
      },
      Source: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      DateAdded: {
        type: DataTypes.DATE,
        allowNull: true,
        // Consider mapping to createdAt if appropriate
      },
      Severity: {
        type: DataTypes.STRING(4000), // Use TEXT if length exceeds typical STRING limits
        allowNull: true,
      },
      CodeType: {
        type: DataTypes.INTEGER,
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
      CeRxCode: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      CeRxCodeSystem: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      // Sequelize handles createdAt and updatedAt automatically if timestamps: true
    },
    {
      tableName: "kroll_patient_cnd",
      timestamps: true, // Enable createdAt and updatedAt
      // Map DateAdded to createdAt if it serves that purpose
      // createdAt: 'DateAdded',
      // updatedAt: 'updatedAt', // Standard Sequelize field
      // underscored: true // Optional
    }
  );

  KrollPatientCnd.associate = (models) => {
    KrollPatientCnd.belongsTo(models.KrollPatient, {
      foreignKey: "PatID",
      as: "patient",
    });
  };

  return KrollPatientCnd;
};
