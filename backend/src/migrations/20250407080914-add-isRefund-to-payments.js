"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("payments", "isRefund", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      after: "ExternalTransactionId", // Optional: Place column after specific field
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("payments", "isRefund");
  },
};
