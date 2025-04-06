"use strict";
module.exports = (sequelize, DataTypes) => {
  const KrollPatientPlan = sequelize.define(
    "KrollPatientPlan",
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
      Sequence: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      PlanID: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "kroll_plan",
          key: "id",
        },
        field: "PlanID", // Explicitly map
      },
      SubPlanID: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "kroll_plan_sub",
          key: "id",
        },
        field: "SubPlanID", // Explicitly map
      },
      Cardholder: {
        type: DataTypes.STRING(25),
        allowNull: true,
      },
      CarrierID: {
        type: DataTypes.STRING(2),
        allowNull: true,
      },
      GroupID: {
        type: DataTypes.STRING(11),
        allowNull: true,
      },
      ClientID: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      CPHAPatCode: {
        type: DataTypes.STRING(3),
        allowNull: true,
      },
      Expiry: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      Rel: {
        type: DataTypes.STRING(2),
        allowNull: true,
      },
      DeductType: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      DeductValue: {
        type: DataTypes.CHAR(15), // Sequelize uses STRING for CHAR
        allowNull: true,
      },
      Comment: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      LinkID: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      AlwaysUseInRx: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      InterventionCode: {
        type: DataTypes.STRING(4),
        allowNull: true,
      },
      YearlyDeductLimit: {
        type: DataTypes.DECIMAL(9, 2),
        allowNull: true,
      },
      YearlyDeductAccum: {
        type: DataTypes.DECIMAL(9, 2),
        allowNull: true,
      },
      YearlyDeductType: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      YearlyDeductValue: {
        type: DataTypes.STRING(15),
        allowNull: true,
      },
      FirstName: {
        type: DataTypes.STRING(25),
        allowNull: true,
      },
      InactivatedOn: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      Birthday: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      PatSex: {
        type: DataTypes.STRING(1),
        allowNull: true,
      },
      LastName: {
        type: DataTypes.STRING(25),
        allowNull: true,
      },
      Deleted: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      // Sequelize handles createdAt and updatedAt automatically if timestamps: true
    },
    {
      tableName: "kroll_patient_plan",
      timestamps: true, // Enable createdAt and updatedAt
      // underscored: true // Optional: if you want Sequelize to auto-convert camelCase to snake_case
    }
  );

  KrollPatientPlan.associate = (models) => {
    KrollPatientPlan.belongsTo(models.KrollPatient, {
      foreignKey: "PatID",
      as: "patient",
    });
    KrollPatientPlan.belongsTo(models.KrollPlan, {
      foreignKey: "PlanID",
      as: "plan",
    });
    KrollPatientPlan.belongsTo(models.KrollPlanSub, {
      foreignKey: "SubPlanID",
      as: "subplan",
    });
    KrollPatientPlan.hasMany(models.KrollRxPrescriptionPlan, {
      foreignKey: "PatPlnID", // The FK in KrollRxPrescriptionPlan pointing to KrollPatientPlan
      as: "prescription_plans",
    });
  };

  return KrollPatientPlan;
};
