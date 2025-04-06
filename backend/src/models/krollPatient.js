module.exports = (sequelize, DataTypes) => {
  const KrollPatient = sequelize.define(
    "KrollPatient",
    {
      // --- Core Identification ---
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        unique: true,
      },
      FamilyID: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      Code: {
        // #varchar40 in SQLAlchemy comment
        type: DataTypes.STRING(40),
        allowNull: true,
      },
      LastName: {
        // #varchar25 in SQLAlchemy comment
        type: DataTypes.STRING(25),
        allowNull: false,
      },
      FirstName: {
        // #varchar25 in SQLAlchemy comment
        type: DataTypes.STRING(25),
        allowNull: false,
      },
      AlternateLastName: {
        // String in SQLAlchemy, no length
        type: DataTypes.STRING,
        allowNull: true,
      },

      // --- Address Information ---
      Address1: {
        // #varchar40 in SQLAlchemy comment
        type: DataTypes.STRING(40),
        allowNull: true,
      },
      Address2: {
        // #varchar40 in SQLAlchemy comment
        type: DataTypes.STRING(40),
        allowNull: true,
      },
      City: {
        // #varchar25 in SQLAlchemy comment
        type: DataTypes.STRING(25),
        allowNull: true,
      },
      Prov: {
        // #varchar2 in SQLAlchemy comment
        type: DataTypes.STRING(2),
        allowNull: false,
      },
      Postal: {
        // #varchar10 in SQLAlchemy comment
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      Country: {
        // #varchar20 in SQLAlchemy comment
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      AddressLink: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      AddressVerificationFlags: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      // --- Demographic Information ---
      Birthday: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      Sex: {
        // CHAR in SQLAlchemy, no length (defaults often to 1)
        type: DataTypes.CHAR,
        allowNull: false,
      },
      Language: {
        // CHAR in SQLAlchemy, no length (defaults often to 1)
        type: DataTypes.CHAR,
        allowNull: false,
      },
      Weight: {
        // #varchar10 in SQLAlchemy comment
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      Height: {
        // #varchar10 in SQLAlchemy comment
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      EMail: {
        // #varchar50 in SQLAlchemy comment
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      Salutation: {
        // #varchar6 in SQLAlchemy comment
        type: DataTypes.STRING(6),
        allowNull: true,
      },
      LanguageSpoken: {
        // String in SQLAlchemy, no length
        type: DataTypes.STRING,
        allowNull: true,
      },
      IsAnimal: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      AnimalType: {
        // String in SQLAlchemy, no length
        type: DataTypes.STRING,
        allowNull: true,
      },
      AnimalOwnerPatId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      PatType: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      // --- Rx and Financial Information ---
      RxTotalsResetDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      TotalDollars: {
        // numeric(9,2)
        type: DataTypes.DECIMAL(9, 2),
        allowNull: true,
      },
      TotalRx: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      PriceGroup: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      ARID: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      UnitDosePatPrcGrpId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      // --- Status and Audit Timestamps (from Kroll) ---
      CreatedOn: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      LastChanged: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      LastUsed: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      Active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      MergedToId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      NetworkSynchronizedDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      // --- Comments and Preferences ---
      Comment: {
        // Text in SQLAlchemy
        type: DataTypes.TEXT,
        allowNull: true,
      },
      LargeSig: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      FirstDrugName: {
        // SmallInteger in SQLAlchemy
        type: DataTypes.SMALLINT,
        allowNull: true,
      },
      SecondDrugName: {
        // SmallInteger in SQLAlchemy
        type: DataTypes.SMALLINT,
        allowNull: true,
      },
      PrintCompliance: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      NoWalletCard: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      RemQtyLabelType: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      VialIdentifier: {
        // String in SQLAlchemy, no length
        type: DataTypes.STRING,
        allowNull: true,
      },

      // --- KrollCare / Snap ---
      DefKrollCare: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      KrollCare: {
        // CHAR in SQLAlchemy, no length (defaults often to 1)
        type: DataTypes.CHAR,
        allowNull: true,
      },
      SnapRequested: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      SnapDocumented: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      NoKrollCare: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },

      // --- Delivery ---
      DeliveryRoute: {
        // #char10 in SQLAlchemy comment
        type: DataTypes.CHAR(10),
        allowNull: true,
      },
      DeliveryRouteType: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      DeliveryRouteTypeMask: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      DefaultDeliveryRouteId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      DefaultDeliveryRouteServiceId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      // --- Network / Pharmanet ---
      NetworkKeyword: {
        // #varchar50 in SQLAlchemy comment
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      PharmanetLog: {
        // Text in SQLAlchemy
        type: DataTypes.TEXT,
        allowNull: true,
      },
      NetworkKeywordDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      NetworkId: {
        // String in SQLAlchemy, no length
        type: DataTypes.STRING,
        allowNull: true,
      },
      NetworkIdRoot: {
        // String in SQLAlchemy, no length
        type: DataTypes.STRING,
        allowNull: true,
      },
      PharmacyLinkFlags: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      // --- Nursing Home (NH) ---
      NHID: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      NHWardID: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      NHAdmitDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      NHDischargeDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      NHDeceasedDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      NHRoom: {
        // String in SQLAlchemy, no length
        type: DataTypes.STRING,
        allowNull: true,
      },
      NHBed: {
        // String in SQLAlchemy, no length
        type: DataTypes.STRING,
        allowNull: true,
      },
      NHLastTMRDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      NHInactive: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      NHDiet: {
        // String in SQLAlchemy, no length
        type: DataTypes.STRING,
        allowNull: true,
      },
      NHComment: {
        // String in SQLAlchemy, no length
        type: DataTypes.STRING,
        allowNull: true,
      },
      DefaultNHCycleId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      // --- Unit Dose ---
      UnitDoseType: {
        // SmallInteger in SQLAlchemy
        type: DataTypes.SMALLINT,
        allowNull: true,
      },
      UnitDoseCycle: {
        // SmallInteger in SQLAlchemy
        type: DataTypes.SMALLINT,
        allowNull: true,
      },
      UnitDoseStrategyID: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      // --- Auto Refill ---
      AutoRefillStatus: {
        // SmallInteger in SQLAlchemy
        type: DataTypes.SMALLINT,
        allowNull: true,
      },
      AutoRefillNotification: {
        // SmallInteger in SQLAlchemy
        type: DataTypes.SMALLINT,
        allowNull: true,
      },

      // --- Store Information ---
      StoreID: {
        // SmallInteger in SQLAlchemy
        type: DataTypes.SMALLINT,
        allowNull: true,
      },
      StoreLocal: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },

      // --- Misc / Other ---
      LastTMRPrinted: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      OCMPin: {
        // String in SQLAlchemy, no length
        type: DataTypes.STRING,
        allowNull: true,
      },
      PickupNotificationEnrolment: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      DoubleCount: {
        // SmallInteger in SQLAlchemy
        type: DataTypes.SMALLINT,
        allowNull: true,
      },
    },
    {
      tableName: "kroll_patient",
      timestamps: false, // Match SQLAlchemy model (no createdAt/updatedAt)
    }
  );

  KrollPatient.associate = (models) => {
    // --- Relationships from original Sequelize model (verified/kept) ---
    KrollPatient.hasMany(models.Payment, {
      foreignKey: "PatientId", // FK in Payment table
      sourceKey: "id", // PK in KrollPatient table
      as: "payments",
    });

    KrollPatient.hasMany(models.Invoice, {
      foreignKey: "PatientId", // FK in Invoice table
      sourceKey: "id", // PK in KrollPatient table
      as: "invoices",
    });

    KrollPatient.hasMany(models.MonthlyStatement, {
      foreignKey: "PatientId", // FK in MonthlyStatement table
      sourceKey: "id", // PK in KrollPatient table
      as: "monthly_statements",
    });

    KrollPatient.hasMany(models.KrollRxPrescription, {
      foreignKey: "PatID", // FK in KrollRxPrescription table
      sourceKey: "id", // PK in KrollPatient table
      as: "prescriptions",
    });

    // --- Relationships added based on SQLAlchemy model ---
    KrollPatient.hasMany(models.KrollPatientPhone, {
      foreignKey: "PatID", // FK in KrollPatientPhone table
      sourceKey: "id", // PK in KrollPatient table
      as: "patient_phones", // Alias matches SQLAlchemy back_populates
    });

    KrollPatient.hasMany(models.KrollPatientPlan, {
      foreignKey: "PatID", // FK in KrollPatientPlan table
      sourceKey: "id", // PK in KrollPatient table
      as: "patient_plans", // Alias matches SQLAlchemy back_populates
    });

    KrollPatient.hasMany(models.KrollPatientCom, {
      foreignKey: "PatID", // FK in KrollPatientCom table
      sourceKey: "id", // PK in KrollPatient table
      as: "patient_coms", // Alias matches SQLAlchemy back_populates
    });

    KrollPatient.hasMany(models.KrollPatientCnd, {
      foreignKey: "PatID", // FK in KrollPatientCnd table
      sourceKey: "id", // PK in KrollPatient table
      as: "patient_cnds", // Alias matches SQLAlchemy back_populates
    });

    KrollPatient.hasMany(models.KrollPatientAlg, {
      foreignKey: "PatID", // FK in KrollPatientAlg table
      sourceKey: "id", // PK in KrollPatient table
      as: "patient_algs", // Alias matches SQLAlchemy back_populates
    });
  };

  return KrollPatient;
};
