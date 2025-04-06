"use strict";
module.exports = (sequelize, DataTypes) => {
  const KrollDrugPack = sequelize.define(
    "KrollDrugPack",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        unique: true,
      },
      DrgID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "kroll_drug",
          key: "id",
        },
        field: "DrgID", // Explicit map
      },
      QuickCode: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      Active: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      UPC: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      PackSize: {
        type: DataTypes.DECIMAL(9, 1),
        allowNull: false,
      },
      PackType: {
        type: DataTypes.STRING(40),
        allowNull: true,
      },
      PackUnit: {
        type: DataTypes.STRING(40),
        allowNull: true,
      },
      PackDesc: {
        type: DataTypes.STRING(80),
        allowNull: true,
      },
      CaseSize: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      OrderByCase: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      OnHandQty: {
        type: DataTypes.DECIMAL(22, 3),
        allowNull: true,
      },
      MinOnHandQty: {
        type: DataTypes.DECIMAL(22, 1),
        allowNull: true,
      },
      MaxOnHandQty: {
        type: DataTypes.DECIMAL(22, 1),
        allowNull: true,
      },
      AcqCost: {
        type: DataTypes.DECIMAL(9, 2),
        allowNull: true,
      },
      SellingCost: {
        type: DataTypes.DECIMAL(9, 2),
        allowNull: true,
      },
      UserCost1: {
        type: DataTypes.DECIMAL(9, 2),
        allowNull: true,
      },
      UserCost2: {
        type: DataTypes.DECIMAL(9, 2),
        allowNull: true,
      },
      UserCost3: {
        type: DataTypes.DECIMAL(9, 2),
        allowNull: true,
      },
      AcqCostChgdDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      SellingCostChgdDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      UserCost1ChgdDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      UserCost2ChgdDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      UserCost3ChgdDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      LastAcqCost: {
        type: DataTypes.DECIMAL(9, 2),
        allowNull: true,
      },
      LastSellingCost: {
        type: DataTypes.DECIMAL(9, 2),
        allowNull: true,
      },
      LastUserCost1: {
        type: DataTypes.DECIMAL(9, 2),
        allowNull: true,
      },
      LastUserCost2: {
        type: DataTypes.DECIMAL(9, 2),
        allowNull: true,
      },
      LastUserCost3: {
        type: DataTypes.DECIMAL(9, 2),
        allowNull: true,
      },
      Lot: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      Expiry: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      InvResetDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      Created: {
        type: DataTypes.DATE,
        allowNull: true,
        // Map to createdAt?
      },
      Changed: {
        type: DataTypes.DATE,
        allowNull: true,
        // Map to updatedAt?
      },
      Purge: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      LastUsed: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      ExpiryDays: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      ForceOrder: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      DefOrderQty: {
        type: DataTypes.DECIMAL(22, 2),
        allowNull: true,
      },
      DisableAutoOrder: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      DisableInvAdj: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      MinDays: {
        type: DataTypes.DECIMAL,
        allowNull: true,
      },
      MaxDays: {
        type: DataTypes.DECIMAL,
        allowNull: true,
      },
      MinScripts: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      AvgRxQty: {
        type: DataTypes.DECIMAL,
        allowNull: true,
      },
      AvgDailyUsage: {
        type: DataTypes.DECIMAL,
        allowNull: true,
      },
      LastAvgCalcDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      AcqCostChgdBy: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      SellingCostChgdBy: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      UserCost1ChgdBy: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      UserCost2ChgdBy: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      UserCost3ChgdBy: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      KrollMaintained: {
        type: DataTypes.SMALLINT,
        allowNull: true,
      },
      StoreID: {
        type: DataTypes.SMALLINT,
        allowNull: true,
      },
      BaseOrderingOn: {
        type: DataTypes.SMALLINT,
        allowNull: true,
      },
      FrontStore: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      OrderQtyMultiple: {
        type: DataTypes.INTEGER,
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
      DefVendor: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      CentralMaintOverrideFieldMask: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      CentralMaintAllowOverrideFieldMask: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      MaxRxQty: {
        type: DataTypes.DECIMAL,
        allowNull: true,
      },
      MinScriptsCalcType: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      LastCycleCountDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      AcqCostChgdByUserId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      SellingCostChgdByUserId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      UserCost1ChgdByUserId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      UserCost2ChgdByUserId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      UserCost3ChgdByUserId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      UserCost4: {
        type: DataTypes.DECIMAL(9, 2),
        allowNull: true,
      },
      UserCost5: {
        type: DataTypes.DECIMAL(9, 2),
        allowNull: true,
      },
      UserCost4ChgdDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      UserCost5ChgdDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      LastUserCost4: {
        type: DataTypes.DECIMAL(9, 2),
        allowNull: true,
      },
      LastUserCost5: {
        type: DataTypes.DECIMAL(9, 2),
        allowNull: true,
      },
      UserCost4ChgdBy: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      UserCost5ChgdBy: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      UserCost4ChgdByUserId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      UserCost5ChgdByUserId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      UseSellingCostGridPrice: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      UseUserCost1GridPrice: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      UseUserCost2GridPrice: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      UseUserCost3GridPrice: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      UseUserCost4GridPrice: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      UseUserCost5GridPrice: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      MarkupPercent: {
        type: DataTypes.DECIMAL(9, 3),
        allowNull: true,
      },
      // Sequelize handles createdAt and updatedAt automatically if timestamps: true
    },
    {
      tableName: "kroll_drug_pack",
      timestamps: true, // Enable createdAt and updatedAt
      // Map Created/Changed if necessary
      // createdAt: 'Created',
      // updatedAt: 'Changed',
      // underscored: true // Optional
    }
  );

  KrollDrugPack.associate = (models) => {
    KrollDrugPack.belongsTo(models.KrollDrug, {
      foreignKey: "DrgID",
      as: "drug",
    });
    KrollDrugPack.hasMany(models.KrollDrugPackInvHist, {
      foreignKey: "DrgPackID", // Foreign key in KrollDrugPackInvHist
      as: "inventory_history",
    });
  };

  return KrollDrugPack;
};
