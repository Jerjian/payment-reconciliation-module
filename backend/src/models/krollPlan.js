"use strict";
module.exports = (sequelize, DataTypes) => {
  const KrollPlan = sequelize.define(
    "KrollPlan",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        unique: true,
      },
      PlanCode: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      Description: {
        type: DataTypes.STRING(40),
        allowNull: true,
      },
      PharmacyID: {
        type: DataTypes.STRING(11),
        allowNull: true,
      },
      Address1: {
        type: DataTypes.STRING(40),
        allowNull: true,
      },
      Address2: {
        type: DataTypes.STRING(40),
        allowNull: true,
      },
      City: {
        type: DataTypes.STRING(25),
        allowNull: true,
      },
      Prov: {
        type: DataTypes.STRING(2),
        allowNull: true,
      },
      Postal: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      Country: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      Contact: {
        type: DataTypes.STRING(40),
        allowNull: true,
      },
      Comment: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      Phone: {
        type: DataTypes.STRING(14),
        allowNull: true,
      },
      Fax: {
        type: DataTypes.STRING(14),
        allowNull: true,
      },
      AdjHostID: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      BIN: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      PrimaryRoute: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      SecondaryRoute: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      ProvincialPlanCode: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      CancelDays: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      TrialRx: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      Triplicate: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      PayPatient: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      AlternatePayee: {
        type: DataTypes.BOOLEAN,
        allowNull: false, // Assuming this should match SQLAlchemy definition
        // defaultValue: false // If needed
      },
      DailyDetail: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      DefaultRel: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      MixType: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      MixDIN: {
        type: DataTypes.STRING(13),
        allowNull: true,
      },
      CheckCoverage: {
        type: DataTypes.BOOLEAN,
        allowNull: false, // Assuming this should match SQLAlchemy definition
        // defaultValue: false // If needed
      },
      UseGlobal: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      FeePerMin: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      DontChargeMixTimeBelow: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      UpchargeOnMixFeePercent: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      CheckMixCoverage: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      IsProvincialPlan: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      IsRealTime: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      FormularyStrategyID: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      UseAlternateDocNum: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      CentralMaintId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      CentralMaintFieldMask: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      ClinicalAdjHostId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      UseAlternatePharmacistId: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      SendBCPharmanetSpecialAuthCodes: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      CentralMaintFieldMask2: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      // Sequelize handles createdAt and updatedAt automatically if timestamps: true
    },
    {
      tableName: "kroll_plan",
      timestamps: true, // Enable createdAt and updatedAt
      // underscored: true // Optional: auto-convert camelCase to snake_case
    }
  );

  KrollPlan.associate = (models) => {
    KrollPlan.hasMany(models.KrollPlanSub, {
      foreignKey: "PlanID",
      as: "subplans",
    });
    KrollPlan.hasMany(models.KrollPatientPlan, {
      foreignKey: "PlanID",
      as: "patient_plans",
    });
  };

  return KrollPlan;
};
