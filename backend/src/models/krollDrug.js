"use strict";
module.exports = (sequelize, DataTypes) => {
  const KrollDrug = sequelize.define(
    "KrollDrug",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        unique: true,
      },
      BrandName: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      GenericName: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      DIN: {
        type: DataTypes.STRING(13),
        allowNull: false,
      },
      Manufacturer: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      Description: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      Comment: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      Active: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      KrollMaintained: {
        type: DataTypes.SMALLINT,
        allowNull: true,
      },
      Form: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      Strength: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      Package: {
        type: DataTypes.BOOLEAN,
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
      Maintenance: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      ClinicalId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      DefaultSig: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      LinkedDrug: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      LinkMsg: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      LinkMsgSeverity: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      ProductType: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      PriceGroup: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      ExpiryDays: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      FollowupDays: {
        type: DataTypes.SMALLINT,
        allowNull: true,
      },
      AutoDispLocation: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      Location: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      Created: {
        type: DataTypes.DATE,
        allowNull: true,
        // Map to createdAt? depends on usage
      },
      Changed: {
        type: DataTypes.DATE,
        allowNull: true,
        // Map to updatedAt? depends on usage
      },
      Purge: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      EquivTo: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      OralWritten: {
        type: DataTypes.SMALLINT,
        allowNull: true,
      },
      SubDrgID: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      KrollID: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      PrintCompliance: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      IsTrial: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      FirstDrugName: {
        type: DataTypes.SMALLINT,
        allowNull: true,
      },
      SecondDrugName: {
        type: DataTypes.SMALLINT,
        allowNull: true,
      },
      IsWardStock: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      IsFlavorRx: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      HalfSizeSig: {
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
      InterchangeablePriority: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      BrandGenericType: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      TADin: {
        type: DataTypes.STRING(13),
        allowNull: true,
      },
      DepartmentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      CentralMaintFieldMask2: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      ScriptChekImageKey: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      DrgMessageMastId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      EligibleForCoupon: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      IsDevice: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      IsImmunization: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      FeeForServiceType: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      FollowupFeeForServiceType: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      DinType: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      DrgFormId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      FDBRouteCode: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      MergedToId: {
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
      CentralMaintOverrideFieldMask2: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      CentralMaintAllowOverrideFieldMask2: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      HandlingInstructions: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      Description2: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      ShapeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      ColourId1: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      ColourId2: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      Markings1: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      Markings2: {
        type: DataTypes.STRING,
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
      Refrigerated: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      IsMethadone: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      DoubleCount: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      RxSync: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      UserField1: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      UserField2: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      UserField3: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      DrgType: {
        type: DataTypes.INTEGER,
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
      VaccineCode: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      VaccineCodeType: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      // Sequelize handles createdAt and updatedAt automatically if timestamps: true
    },
    {
      tableName: "kroll_drug",
      timestamps: true, // Enable createdAt and updatedAt
      // Map 'Created' and 'Changed' if needed
      // createdAt: 'Created',
      // updatedAt: 'Changed',
      // underscored: true // Optional
    }
  );

  KrollDrug.associate = (models) => {
    KrollDrug.hasMany(models.KrollDrugPack, {
      foreignKey: "DrgID", // Foreign key in KrollDrugPack
      as: "drug_packs",
    });
    KrollDrug.hasMany(models.KrollRxPrescription, {
      foreignKey: "DrgID", // Foreign key in KrollRxPrescription
      as: "prescriptions",
    });
  };

  return KrollDrug;
};
