"use strict";
module.exports = (sequelize, DataTypes) => {
  const KrollPatientAlg = sequelize.define(
    "KrollPatientAlg",
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
        allowNull: false,
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
        // Consider mapping to createdAt
      },
      Severity: {
        type: DataTypes.STRING(4000), // Use TEXT if > standard STRING limits
        allowNull: true,
      },
      CodeType: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      // Sequelize handles createdAt and updatedAt automatically if timestamps: true
    },
    {
      tableName: "kroll_patient_alg",
      timestamps: true, // Enable createdAt and updatedAt
      // Map DateAdded to createdAt if appropriate
      // createdAt: 'DateAdded',
      // underscored: true // Optional
    }
  );

  KrollPatientAlg.associate = (models) => {
    KrollPatientAlg.belongsTo(models.KrollPatient, {
      foreignKey: "PatID",
      as: "patient",
    });
  };

  return KrollPatientAlg;
};
