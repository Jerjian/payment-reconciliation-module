"use strict";
module.exports = (sequelize, DataTypes) => {
  const KrollDrugMix = sequelize.define(
    "KrollDrugMix",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        unique: true,
      },
      Description: {
        type: DataTypes.STRING(200),
        allowNull: true, // Assuming based on SQLAlchemy
      },
      QuickCode: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      CompEnterType: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      ConvFactor: {
        type: DataTypes.DECIMAL(10, 2), // DECIMAL maps to DECIMAL(precision, scale)
        allowNull: true,
      },
      BatchQty: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      Schedule: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      Reportable: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      PriceGroup: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      CompoundType: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      ActCompP3: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      Instructions: {
        type: DataTypes.BLOB, // Use BLOB for LargeBinary/varbinary(max)
        allowNull: true,
      },
      Created: {
        type: DataTypes.DATE,
        allowNull: true,
        // Map to createdAt if applicable
      },
      Changed: {
        type: DataTypes.DATE,
        allowNull: true,
        // Map to updatedAt if applicable
      },
      Purge: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      ExpiryDays: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      Form: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      PrntInstrAtFill: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      PrntBatchAndFill: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      ChrgQtyThres1: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      ChrgQtyThres2: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      ChrgQtyThres3: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      ChrgQtyThres4: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      ChrgQtyThres5: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      ChrgQty1: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      ChrgQty2: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      ChrgQty3: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      ChrgQty4: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      ChrgQty5: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      LastUsed: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      OralWritten: {
        type: DataTypes.SMALLINT,
        allowNull: true,
      },
      IsMethadone: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      IsIV: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      DrgMixTimeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      DefaultSig: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      Active: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      EligibleForCoupon: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      DrgFormId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      FDBRouteCode: {
        type: DataTypes.STRING(2),
        allowNull: true,
      },
      MergedToId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      HandlingInstructions: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      RequireLotNumWhenPackaging: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      RequireExpiryDateWhenPackaging: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      RequireIngredientConfirmationWhenPackaging: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      Refrigerated: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      RefillRemindersAllowed: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      RefillReminderDefault: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      // Sequelize handles createdAt and updatedAt automatically if timestamps: true
    },
    {
      tableName: "kroll_drug_mix",
      timestamps: true, // Enable createdAt and updatedAt
      // Map 'Created' and 'Changed' if needed
      // createdAt: 'Created',
      // updatedAt: 'Changed',
      // underscored: true // Optional
    }
  );

  KrollDrugMix.associate = (models) => {
    KrollDrugMix.hasMany(models.KrollRxPrescription, {
      foreignKey: "MixID", // Foreign key in KrollRxPrescription
      as: "prescriptions",
    });
  };

  return KrollDrugMix;
};
