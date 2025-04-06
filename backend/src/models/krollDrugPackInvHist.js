"use strict";
module.exports = (sequelize, DataTypes) => {
  const KrollDrugPackInvHist = sequelize.define(
    "KrollDrugPackInvHist",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true, // Assuming id is auto-incrementing PK
        allowNull: false,
      },
      DrgPackID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "kroll_drug_pack",
          key: "id",
        },
        field: "DrgPackID", // Explicit map
      },
      ChangeType: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      User: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      TS: {
        type: DataTypes.DATE,
        allowNull: false,
        // This likely corresponds to createdAt or a specific event timestamp
        // Consider mapping if using standard timestamps: createdAt: 'TS'
      },
      RxNum: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      PONum: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      OldValue: {
        type: DataTypes.DECIMAL(22, 3),
        allowNull: true,
      },
      NewValue: {
        type: DataTypes.DECIMAL(22, 3),
        allowNull: true,
      },
      Reason: {
        type: DataTypes.STRING(250),
        allowNull: true,
      },
      RxWorkflowId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      RxWorkflowPackId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      VendorId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      DeltaAcqCost: {
        type: DataTypes.DECIMAL(22, 4),
        allowNull: true,
      },
      StoreId: {
        type: DataTypes.SMALLINT,
        allowNull: true,
      },
      CycleCountId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      UserId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      // Sequelize handles createdAt and updatedAt automatically if timestamps: true
    },
    {
      tableName: "kroll_drug_pack_inv_hist",
      timestamps: true, // Enable standard createdAt/updatedAt
      // Map TS to createdAt if it represents creation time
      // createdAt: 'TS',
      // underscored: true // Optional
    }
  );

  KrollDrugPackInvHist.associate = (models) => {
    KrollDrugPackInvHist.belongsTo(models.KrollDrugPack, {
      foreignKey: "DrgPackID",
      as: "drug_pack",
    });
  };

  return KrollDrugPackInvHist;
};
