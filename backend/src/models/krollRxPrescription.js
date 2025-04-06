"use strict";
module.exports = (sequelize, DataTypes) => {
  const KrollRxPrescription = sequelize.define(
    "KrollRxPrescription",
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
        field: "PatID", // Explicit map
      },
      DrgID: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "kroll_drug",
          key: "id",
        },
        field: "DrgID", // Explicit map
      },
      MixID: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "kroll_drug_mix",
          key: "id",
        },
        field: "MixID", // Explicit map
      },
      // DocID FK omitted as per SQLAlchemy comment
      OrigRxNum: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      RxNum: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: "uq_kroll_rx_prescription_rxnum", // Match unique constraint
      },
      Init: {
        type: DataTypes.STRING(6),
        allowNull: true,
      },
      FillDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      CancelDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      FirstFillDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      LastFillDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      DispQty: {
        type: DataTypes.DECIMAL(11, 3),
        allowNull: false,
      },
      NextFillQty: {
        type: DataTypes.DECIMAL(11, 3),
        allowNull: true,
      },
      AuthQty: {
        type: DataTypes.DECIMAL(11, 3),
        allowNull: true,
      },
      RemQty: {
        type: DataTypes.DECIMAL(11, 3),
        allowNull: true,
      },
      DaysSupply: {
        type: DataTypes.SMALLINT,
        allowNull: true,
      },
      Labels: {
        type: DataTypes.SMALLINT,
        allowNull: true,
      },
      ProductSelection: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      OralWritten: {
        type: DataTypes.CHAR(1), // STRING(1) in Sequelize
        allowNull: true,
      },
      SIG: {
        type: DataTypes.STRING(2000),
        allowNull: true,
      },
      SigCRC: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      DIN: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      PackSize: {
        type: DataTypes.DECIMAL(9, 1),
        allowNull: true,
      },
      AAC: {
        type: DataTypes.DECIMAL(9, 2),
        allowNull: true,
      },
      Cost: {
        type: DataTypes.DECIMAL(9, 2),
        allowNull: true,
      },
      Markup: {
        type: DataTypes.DECIMAL(9, 2),
        allowNull: true,
      },
      Fee: {
        type: DataTypes.DECIMAL(9, 2),
        allowNull: true,
      },
      MixTime: {
        type: DataTypes.SMALLINT,
        allowNull: true,
      },
      MixFee: {
        type: DataTypes.DECIMAL(9, 2),
        allowNull: true,
      },
      SSCFee: {
        type: DataTypes.DECIMAL(9, 2),
        allowNull: true,
      },
      PriceDiscount: {
        type: DataTypes.DECIMAL(9, 2),
        allowNull: true,
      },
      DeductDiscount: {
        type: DataTypes.DECIMAL(9, 2),
        allowNull: true,
      },
      ManualPrice: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      TrialRx: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      PartialFill: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      DrugExpiryDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      StopDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      RxExpiryDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      FollowUpDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      Status: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      Lot: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      DocAddressLoc: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      SplitQty: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      SplitEvenly: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      LabelQtySplit: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      AdjState: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      Inactive: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      CopiedTo: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      CopiedFrom: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      TherapeuticStartDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      TransferredFromDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      TransferredToDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      ScriptImage: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      DiscountCost: {
        type: DataTypes.DECIMAL(9, 2),
        allowNull: true,
      },
      DiscountFee: {
        type: DataTypes.DECIMAL(9, 2),
        allowNull: true,
      },
      DiscountMarkup: {
        type: DataTypes.DECIMAL(9, 2),
        allowNull: true,
      },
      DiscountMixFee: {
        type: DataTypes.DECIMAL(9, 2),
        allowNull: true,
      },
      DiscountSSCFee: {
        type: DataTypes.DECIMAL(9, 2),
        allowNull: true,
      },
      UserInit: {
        type: DataTypes.CHAR(10), // Adjusted length based on potential use (SQLAlchemy had CHAR no length)
        allowNull: false,
      },
      UnitDoseStartDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      WrittenDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      MinIntervalDays: {
        type: DataTypes.SMALLINT,
        allowNull: true,
      },
      BackDatedOn: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      PrcStratID: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      CorporatePriceID: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      Charged: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      POSPending: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      NHCycle: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      NHBatchFill: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      NHUnitDose: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      NHSplitQty: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      NHSplitEvenly: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      NHBatchUseBatchValues: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      NHBatchDailyDosage: {
        type: DataTypes.DECIMAL(11, 3),
        allowNull: true,
      },
      NHBatchRegLabels: {
        type: DataTypes.SMALLINT,
        allowNull: true,
      },
      NHBatchNHLabels: {
        type: DataTypes.SMALLINT,
        allowNull: true,
      },
      MethadoneIngestDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      IsHidden: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      POSTrigger: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      NarcRefNum: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      IsMistake: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      OrderReceived: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      StoreID: {
        type: DataTypes.SMALLINT,
        allowNull: true,
      },
      NHID: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      NHWardID: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      RxChangedOn: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      DrgPackTierId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      WorkOrderId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      ForceReportable: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      CeRxRxId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      CeRxDispenseId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      UnitDosePrcStratId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      Merged: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      FeeForServiceType: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      UserField1: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      LastRxStatus: {
        type: DataTypes.SMALLINT,
        allowNull: true,
      },
      InactivatedOn: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      FDBDosageFormCode: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      FDBRouteCode: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      PickupNotificationRequested: {
        type: DataTypes.SMALLINT,
        allowNull: true,
      },
      NHUnitDoseType: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      NHUnitDoseFreq: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      NHUnitDoseAnchorDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      CeRxOrderType: {
        type: DataTypes.SMALLINT,
        allowNull: true,
      },
      CopiedFromReason: {
        type: DataTypes.SMALLINT,
        allowNull: true,
      },
      CopiedToReason: {
        type: DataTypes.SMALLINT,
        allowNull: true,
      },
      WasUndeliverable: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      CancelRefillType: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      NHBatchType: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      LegacyWorkflow: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      CounselingRequired: {
        type: DataTypes.SMALLINT,
        allowNull: true,
      },
      CounselingResponse: {
        type: DataTypes.SMALLINT,
        allowNull: true,
      },
      IdentificationRequiredOnDelivery: {
        type: DataTypes.SMALLINT,
        allowNull: true,
      },
      ScriptImagePosition: {
        type: DataTypes.SMALLINT,
        allowNull: true,
      },
      ScriptImagePage: {
        type: DataTypes.SMALLINT,
        allowNull: true,
      },
      ChargeToAR: {
        type: DataTypes.SMALLINT,
        allowNull: true,
      },
      RxContextInfo: {
        type: DataTypes.BLOB,
        allowNull: true,
      },
      RxContextInfoCompressionType: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      OrderCreatedFromNetwork: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      IsPharmacistPrescribe: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      PasstimeCode: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      DrugSource: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      PrescriptiveAuthority: {
        type: DataTypes.SMALLINT,
        allowNull: true,
      },
      UserId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      UserUserId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      CounselingReason: {
        type: DataTypes.SMALLINT,
        allowNull: true,
      },
      AdjLogInfo: {
        type: DataTypes.BLOB,
        allowNull: true,
      },
      AdjLogInfoCompressionType: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      FillingAdjComplete: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      BaseCost: {
        type: DataTypes.DECIMAL(9, 2),
        allowNull: true,
      },
      CouponValue: {
        type: DataTypes.DECIMAL(9, 2),
        allowNull: true,
      },
      RxRefillSyncType: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      ImmunizationId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      ImmunizationProductType: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      DoNotDispenseBeforeDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      Adapted: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      MagicNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      AdminSites: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      MaxDoseQty1: {
        type: DataTypes.DECIMAL(11, 3),
        allowNull: true,
      },
      MaxDoseQtyUnit1: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      MaxDoseRange1: {
        type: DataTypes.DECIMAL(11, 3),
        allowNull: true,
      },
      MaxDoseRangeUnit1: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      MaxDoseQty2: {
        type: DataTypes.DECIMAL(11, 3),
        allowNull: true,
      },
      MaxDoseQtyUnit2: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      MaxDoseRange2: {
        type: DataTypes.DECIMAL(11, 3),
        allowNull: true,
      },
      MaxDoseRangeUnit2: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      ManualStructuredDosing: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      AdditionalStructuredSig: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      CarryNumber: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      PharmacistPrescribeMedReviewRxId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      MaxDispQty: {
        type: DataTypes.DECIMAL(11, 3),
        allowNull: true,
      },
      TreatmentType: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      NoDocERenewal: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      KrollCareRequested: {
        type: DataTypes.SMALLINT,
        allowNull: true,
      },
      RefillReminderDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      LegalAuthorityExpiryDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      OrigERxOrderId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      RefillRemindersAllowed: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      RenewalReminderDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      CanDoAutoRefill: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      NHDoNotBatchFillBeforeDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      ARId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      CounselingRejectedReason: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      CounselingAgentType: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      CFEligibility: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      CFRefusalReason: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      // Sequelize handles createdAt and updatedAt automatically if timestamps: true
    },
    {
      tableName: "kroll_rx_prescription",
      timestamps: true, // Enable createdAt and updatedAt
      // underscored: true // Optional
      indexes: [
        {
          unique: true,
          fields: ["RxNum"],
          name: "uq_kroll_rx_prescription_rxnum", // Match the constraint name
        },
      ],
    }
  );

  KrollRxPrescription.associate = (models) => {
    KrollRxPrescription.belongsTo(models.KrollPatient, {
      foreignKey: "PatID",
      as: "patient",
    });
    KrollRxPrescription.belongsTo(models.KrollDrug, {
      foreignKey: "DrgID",
      as: "drug",
      allowNull: true, // Match nullable FK
    });
    KrollRxPrescription.belongsTo(models.KrollDrugMix, {
      foreignKey: "MixID",
      as: "drug_mix",
      allowNull: true, // Match nullable FK
    });
    KrollRxPrescription.hasMany(models.KrollRxPrescriptionPlan, {
      foreignKey: "RxNum", // FK in KrollRxPrescriptionPlan
      sourceKey: "RxNum", // Source key in KrollRxPrescription (must be unique)
      as: "prescription_plans",
    });
    KrollRxPrescription.hasOne(models.Invoice, {
      foreignKey: "RxId", // FK in Invoice table
      as: "invoice",
    });
  };

  return KrollRxPrescription;
};
