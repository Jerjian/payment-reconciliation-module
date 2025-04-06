"use strict";
module.exports = (sequelize, DataTypes) => {
  const KrollRxPrescriptionPlan = sequelize.define(
    "KrollRxPrescriptionPlan",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        unique: true,
      },
      Seq: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      RxNum: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "kroll_rx_prescription",
          key: "RxNum", // Target the unique RxNum column
        },
        field: "RxNum", // Explicit map
      },
      PatPlnID: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "kroll_patient_plan",
          key: "id",
        },
        field: "PatPlnID", // Explicit map
      },
      Pays: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      TranType: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      AdjState: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      SubPlanCode: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      IsRT: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      AdjDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      SSC: {
        type: DataTypes.STRING(5),
        allowNull: true,
      },
      SSCFee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      SANum: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      Interventions: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      ReasonCodeRef: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      ReasonCode: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      StreamData: {
        type: DataTypes.BLOB,
        allowNull: true,
      },
      ClaimType: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      AdjSendDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      AdjustmentStatus: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      PseudoDIN: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      AdjudicationLevel: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      PaymentSeq: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      NonDUESeq: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      DiscountSSCFee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      PseudoDinType: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      ClaimTypeOverride: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      DrgMixFeeMastId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      IsClinicalPlan: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      CancelsRxPlnId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      ModifyInProgress: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      CopayStratMastId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      CutbackDiscountCost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      CutbackDiscountMarkup: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      CutbackDiscountFee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      CutbackDiscountMixFee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      CutbackDiscountSSCFee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      CopayDiscountCost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      CopayDiscountMarkup: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      CopayDiscountFee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      CopayDiscountMixFee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      CopayDiscountSSCFee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      AdjudicationAdjustedBits: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      SSCOverride: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      InterventionsOverride: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      // Sequelize handles createdAt and updatedAt automatically if timestamps: true
    },
    {
      tableName: "kroll_rx_prescription_plan",
      timestamps: true, // Enable createdAt and updatedAt
      // underscored: true // Optional
    }
  );

  KrollRxPrescriptionPlan.associate = (models) => {
    KrollRxPrescriptionPlan.belongsTo(models.KrollRxPrescription, {
      foreignKey: "RxNum",
      targetKey: "RxNum", // Target the unique RxNum column
      as: "prescription",
    });
    KrollRxPrescriptionPlan.belongsTo(models.KrollPatientPlan, {
      foreignKey: "PatPlnID",
      as: "patient_plan",
    });
    KrollRxPrescriptionPlan.hasMany(models.KrollRxPrescriptionPlanAdj, {
      foreignKey: "RxPlnID", // FK in KrollRxPrescriptionPlanAdj
      as: "plan_adjustments",
    });
  };

  return KrollRxPrescriptionPlan;
};
