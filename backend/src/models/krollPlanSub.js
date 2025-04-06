"use strict";
module.exports = (sequelize, DataTypes) => {
  const KrollPlanSub = sequelize.define(
    "KrollPlanSub",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        unique: true,
      },
      PlanID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "kroll_plan", // Name of the target model table
          key: "id",
        },
        field: "PlanID", // Explicitly map
      },
      SubPlanCode: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      DefSubPlan: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      Description: {
        type: DataTypes.STRING(40),
        allowNull: false,
        // SQLAlchemy had default=False, but for String, usually default is empty or null
        // defaultValue: false, // This likely needs correction based on actual requirements
      },
      CarrierIDRO: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      GroupRO: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      ClientRO: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      CPHARO: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      RelRO: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      ExpiryRO: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      CarrierIDReq: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      GroupReq: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      ClientReq: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      CPHAReq: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      RelReq: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      ExpiryReq: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      DeductReq: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      BirthReq: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      DefaultCarrierID: {
        type: DataTypes.STRING(2),
        allowNull: true,
      },
      DefaultGroupID: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      DefaultClientID: {
        type: DataTypes.STRING(15),
        allowNull: true,
      },
      DefaultCPHAPatCode: {
        type: DataTypes.STRING(3),
        allowNull: true,
      },
      MaskCarrierID: {
        type: DataTypes.STRING(2),
        allowNull: true,
      },
      MaskGroupID: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      MaskClientID: {
        type: DataTypes.STRING(15),
        allowNull: true,
      },
      MaskCPHAPatCode: {
        type: DataTypes.STRING(3),
        allowNull: true,
      },
      UsePlanPricing: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      UsePlanPatInfo: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      BillingReport: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      Comment: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      CorporateID: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      DefaultDeductType: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      DefaultDeductValue: {
        type: DataTypes.CHAR(15), // Sequelize uses STRING
        allowNull: true,
      },
      ExcludeFromNetworkTotals: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      HelpStr: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      CardImage: {
        type: DataTypes.BLOB, // Use BLOB for LargeBinary
        allowNull: true,
      },
      DeferPricingToSecondPlan: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      AllowFillIfPlanExpired: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      IgnorePatPrcGrp: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      PromptForDeductWhenBillingManually: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      Active: {
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
      DrgPackTierId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      DUEOnly: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      AllowManualBilling: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      TreatAsDUEIfPlanPaysZero: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      CouponPercentage: {
        type: DataTypes.DECIMAL(9, 3),
        allowNull: true,
      },
      CouponMinimumValue: {
        type: DataTypes.DECIMAL(9, 3),
        allowNull: true,
      },
      IsPreferredProviderSubPlan: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      DoPreferredProviderSubPlanSubstitution: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      IgnoreDrgPrcGrp: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      CentralMaintFieldMask2: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      PrintCostBreakdownOnReceipt: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      SingleUse: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      GLAccountNumber: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      // Sequelize handles createdAt and updatedAt automatically if timestamps: true
    },
    {
      tableName: "kroll_plan_sub",
      timestamps: true, // Enable createdAt and updatedAt
      // underscored: true // Optional: auto-convert camelCase to snake_case
    }
  );

  KrollPlanSub.associate = (models) => {
    KrollPlanSub.belongsTo(models.KrollPlan, {
      foreignKey: "PlanID",
      as: "plan",
    });
    KrollPlanSub.hasMany(models.KrollPatientPlan, {
      foreignKey: "SubPlanID",
      as: "patient_plans",
    });
  };

  return KrollPlanSub;
};
