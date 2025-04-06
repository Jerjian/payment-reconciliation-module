"use strict";
module.exports = (sequelize, DataTypes) => {
  const KrollRxPrescriptionPlanAdj = sequelize.define(
    "KrollRxPrescriptionPlanAdj",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        unique: true,
      },
      TS: {
        type: DataTypes.DATE,
        allowNull: false,
        // Map to createdAt?
      },
      RxPlnID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "kroll_rx_prescription_plan",
          key: "id",
        },
        field: "RxPlnID", // Explicit map
      },
      ResultCode: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      AdjDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      InterventionCodes: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      TraceNum: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      RefNum: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      ErrorCodes: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      Messages: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      Cost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      Markup: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      Fee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      MixFee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      SSCFee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      PlanPays: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      Request: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      Response: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      SubCost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      SubMarkup: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      SubFee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      SubMixFee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      SubSSCFee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      PrevPaid: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      SSC: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      SANum: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      AdjudicationLevel: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      DIN: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      ParserType: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      RequestCompressionType: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      ResponseCompressionType: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      RequestData: {
        type: DataTypes.BLOB,
        allowNull: true,
      },
      ResponseData: {
        type: DataTypes.BLOB,
        allowNull: true,
      },
      TransmissionStatus: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      RxNum: {
        type: DataTypes.INTEGER,
        allowNull: false,
        // Note: This is redundant if RxPlnID provides the link, but kept for fidelity
        // It might not need a reference if RxPlnID is the primary link
      },
      AdjResponseDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      RequestEncoding: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      ResponseEncoding: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      ClaimType: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      ClaimResult: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      AdjRouteId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      Copay: {
        type: DataTypes.DECIMAL,
        allowNull: false,
      },
      Deductible: {
        type: DataTypes.DECIMAL,
        allowNull: false,
      },
      CoInsurance: {
        type: DataTypes.DECIMAL,
        allowNull: false,
      },
      // Sequelize handles createdAt and updatedAt automatically if timestamps: true
    },
    {
      tableName: "kroll_rx_prescription_plan_adj",
      timestamps: true, // Enable createdAt and updatedAt
      // Map TS to createdAt?
      // createdAt: 'TS',
      // underscored: true // Optional
    }
  );

  KrollRxPrescriptionPlanAdj.associate = (models) => {
    KrollRxPrescriptionPlanAdj.belongsTo(models.KrollRxPrescriptionPlan, {
      foreignKey: "RxPlnID",
      as: "prescription_plan",
    });
  };

  return KrollRxPrescriptionPlanAdj;
};
