module.exports = (sequelize, DataTypes) => {
  const MonthlyStatement = sequelize.define('MonthlyStatement', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    PatientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'KrollPatient',
        key: 'id'
      }
    },
    StatementDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    StartDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    EndDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    OpeningBalance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    TotalCharges: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    TotalPayments: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    ClosingBalance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    }
  }, {
    tableName: 'monthly_statements',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: false
  });

  MonthlyStatement.associate = (models) => {
    MonthlyStatement.belongsTo(models.KrollPatient, {
      foreignKey: 'PatientId',
      as: 'patient'
    });
  };

  return MonthlyStatement;
}; 