// backend/tests/paymentController.test.js

// Import functions to test
const {
  createPayment,
  updatePayment,
  deletePayment,
} = require("../src/controllers/paymentController");

// Import db object for mocking
const db = require("../src/models");

// --- Mocking Dependencies ---

// Mock the specific database models and their methods
jest.mock("../src/models", () => ({
  sequelize: {
    transaction: jest.fn(() => ({
      commit: jest.fn(),
      rollback: jest.fn(),
    })),
    // Add mocks for Sequelize helper functions used in the helper
    fn: jest.fn(() => {}), // Mock fn (e.g., SUM)
    col: jest.fn((colName) => colName), // Mock col to return the column name
    literal: jest.fn((str) => str), // Mock literal to return the string
  },
  Invoice: {
    findByPk: jest.fn(),
    update: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    // Mock other Invoice methods if needed by controller
  },
  Payment: {
    create: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn(),
    destroy: jest.fn(),
    // Mock save method if used directly on instance (it is in updatePayment)
    save: jest.fn(),
  },
  FinancialStatement: {
    // Mock methods used by updateFinancialStatementForMonth if not mocking the helper
    findOne: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
  },
}));

// Mock the helper function defined within paymentController
// We need a way to access and mock it. This is tricky if it's not exported.
// For simplicity, we'll assume its logic works and focus on whether the controllers call it.
// A better approach would be to export the helper for easier testing.
// For now, we'll track calls indirectly or skip detailed check of this helper call.

// --- Mock Request/Response Objects ---
const mockRequest = (params = {}, body = {}, query = {}) => ({
  params,
  body,
  query,
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

// --- Test Suites ---

describe("Payment Controller", () => {
  let mockTransaction;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Reset the transaction mock for each test
    mockTransaction = {
      commit: jest.fn(),
      rollback: jest.fn(),
    };
    db.sequelize.transaction.mockImplementation(() =>
      Promise.resolve(mockTransaction)
    );

    // Default mock implementations (can be overridden in specific tests)
    db.Invoice.findByPk.mockResolvedValue({
      id: 1,
      PatientId: 10,
      PatientPortion: 100.0,
      AmountPaid: 0,
      Status: "pending",
    });
    db.Invoice.update.mockResolvedValue([1]); // Simulate one row updated
    db.Invoice.findOne.mockResolvedValue(null); // Default for helper
    db.Invoice.findAll.mockResolvedValue([]); // Default for helper (empty array)

    db.Payment.create.mockResolvedValue({
      id: 50,
      InvoiceId: 1,
      Amount: 50.0,
      isRefund: false,
      PaymentDate: new Date(),
    });
    db.Payment.findByPk.mockResolvedValue({
      id: 50,
      InvoiceId: 1,
      Amount: 50.0,
      isRefund: false,
      PaymentDate: new Date(),
      save: jest.fn().mockResolvedValue(this),
      destroy: jest.fn().mockResolvedValue(1),
    });
    db.Payment.findAll.mockResolvedValue([]); // Default for helper AND recalc (empty array)
    db.Payment.destroy.mockResolvedValue(1); // Simulate one row deleted

    // Mock FinancialStatement methods called by the helper (if not mocking helper directly)
    db.FinancialStatement.findOne.mockResolvedValue(null); // Assume no existing statement by default
    db.FinancialStatement.update.mockResolvedValue([1]);
    db.FinancialStatement.create.mockResolvedValue({ id: 1 });
  });

  // --- Tests for createPayment ---
  describe("createPayment", () => {
    const validPaymentData = {
      invoiceId: 1,
      amount: 50.0,
      paymentDate: "2024-04-10",
      paymentMethod: "credit",
      isRefund: false,
    };

    it("should create a payment, update invoice, commit transaction, and return 201", async () => {
      const req = mockRequest({}, validPaymentData);
      const res = mockResponse();
      const createdPaymentMock = { ...validPaymentData, id: 50, PatientId: 10 };

      // Mock the findByPk call made *after* commit to return the created payment
      db.Payment.findByPk.mockResolvedValueOnce(createdPaymentMock);
      // Mock the findAll for recalculation *during* the transaction
      db.Payment.findAll.mockResolvedValueOnce([
        { Amount: 50.0, isRefund: false },
      ]);
      // Mock the create call
      db.Payment.create.mockResolvedValueOnce(createdPaymentMock);

      await createPayment(req, res);

      expect(db.sequelize.transaction).toHaveBeenCalledTimes(1);
      expect(db.Invoice.findByPk).toHaveBeenCalledWith(
        validPaymentData.invoiceId,
        { transaction: mockTransaction }
      );
      expect(db.Payment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          InvoiceId: validPaymentData.invoiceId,
          Amount: validPaymentData.amount,
          PaymentDate: validPaymentData.paymentDate,
          PaymentMethod: validPaymentData.paymentMethod,
          isRefund: validPaymentData.isRefund,
          TransactionStatus: "completed",
        }),
        { transaction: mockTransaction }
      );
      expect(db.Payment.findAll).toHaveBeenCalledWith({
        attributes: ["Amount", "isRefund"],
        where: {
          InvoiceId: validPaymentData.invoiceId,
          TransactionStatus: "completed",
        },
        raw: true,
        transaction: mockTransaction,
      });
      expect(db.Invoice.update).toHaveBeenCalledWith(
        { AmountPaid: "50.00", Status: "partially_paid" }, // Assuming PatientPortion is 100
        {
          where: { id: validPaymentData.invoiceId },
          transaction: mockTransaction,
        }
      );
      // Ideally, mock and check updateFinancialStatementForMonth call here
      expect(mockTransaction.commit).toHaveBeenCalledTimes(1);
      expect(mockTransaction.rollback).not.toHaveBeenCalled();
      expect(db.Payment.findByPk).toHaveBeenCalledWith(createdPaymentMock.id); // Check the final fetch
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(createdPaymentMock);
    });

    it("should return 400 if required fields are missing", async () => {
      const req = mockRequest({}, { invoiceId: 1, amount: 50 }); // Missing paymentDate, paymentMethod
      const res = mockResponse();
      await createPayment(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining("Missing required payment fields"),
        })
      );
      expect(db.sequelize.transaction).not.toHaveBeenCalled();
    });

    it("should return 400 if amount is invalid", async () => {
      const req = mockRequest({}, { ...validPaymentData, amount: -10 }); // Invalid amount
      const res = mockResponse();
      await createPayment(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Invalid amount format or value. Amount must be positive.",
        })
      );
      expect(db.sequelize.transaction).not.toHaveBeenCalled();
    });

    it("should return 404 if invoice is not found", async () => {
      db.Invoice.findByPk.mockResolvedValue(null); // Mock invoice not found
      const req = mockRequest({}, validPaymentData);
      const res = mockResponse();

      await createPayment(req, res);

      expect(db.sequelize.transaction).toHaveBeenCalledTimes(1);
      expect(db.Invoice.findByPk).toHaveBeenCalledWith(
        validPaymentData.invoiceId,
        { transaction: mockTransaction }
      );
      expect(mockTransaction.rollback).toHaveBeenCalledTimes(1);
      expect(mockTransaction.commit).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: `Invoice with ID ${validPaymentData.invoiceId} not found.`,
      });
    });

    it("should return 500 and rollback if database error occurs", async () => {
      const errorMessage = "DB error on create";
      db.Payment.create.mockRejectedValue(new Error(errorMessage)); // Simulate error
      const req = mockRequest({}, validPaymentData);
      const res = mockResponse();
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await createPayment(req, res);

      expect(db.sequelize.transaction).toHaveBeenCalledTimes(1);
      expect(mockTransaction.rollback).toHaveBeenCalledTimes(1);
      expect(mockTransaction.commit).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error creating payment",
        error: errorMessage,
      });
      consoleErrorSpy.mockRestore();
    });
  });

  // --- Tests for updatePayment ---
  describe("updatePayment", () => {
    const paymentId = 50;
    const validUpdateData = { amount: 75.0, paymentMethod: "check" };
    const mockExistingPayment = {
      id: paymentId,
      InvoiceId: 1,
      PatientId: 10,
      Amount: 50.0,
      PaymentDate: new Date("2024-04-01"),
      isRefund: false,
      save: jest.fn().mockReturnThis(), // Mock save to return the instance
    };

    it("should update payment, update invoice, commit transaction, and return 200", async () => {
      db.Payment.findByPk.mockResolvedValueOnce(mockExistingPayment); // Find existing payment
      db.Payment.findAll.mockResolvedValueOnce([
        { Amount: 75.0, isRefund: false },
      ]); // Simulate payments after update for recalc
      // Assume invoice PatientPortion is 100

      const req = mockRequest(
        { paymentId: paymentId.toString() },
        validUpdateData
      );
      const res = mockResponse();

      // Mock the final findByPk call after commit
      const updatedPaymentData = {
        ...mockExistingPayment,
        Amount: 75.0,
        PaymentMethod: "check",
      };
      db.Payment.findByPk.mockResolvedValueOnce(updatedPaymentData);

      await updatePayment(req, res);

      expect(db.sequelize.transaction).toHaveBeenCalledTimes(1);
      expect(db.Payment.findByPk).toHaveBeenCalledWith(paymentId, {
        transaction: mockTransaction,
      });
      expect(mockExistingPayment.save).toHaveBeenCalledWith({
        transaction: mockTransaction,
      });
      expect(db.Payment.findAll).toHaveBeenCalledWith({
        attributes: ["Amount", "isRefund"],
        where: {
          InvoiceId: mockExistingPayment.InvoiceId,
          TransactionStatus: "completed",
        },
        raw: true,
        transaction: mockTransaction,
      });
      expect(db.Invoice.update).toHaveBeenCalledWith(
        { AmountPaid: "75.00", Status: "partially_paid" },
        {
          where: { id: mockExistingPayment.InvoiceId },
          transaction: mockTransaction,
        }
      );
      // Ideally, check updateFinancialStatementForMonth call(s) here
      expect(mockTransaction.commit).toHaveBeenCalledTimes(1);
      expect(mockTransaction.rollback).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updatedPaymentData); // Check final updated data returned
    });

    it("should return 404 if payment to update is not found", async () => {
      db.Payment.findByPk.mockResolvedValue(null);
      const req = mockRequest({ paymentId: "999" }, validUpdateData);
      const res = mockResponse();
      await updatePayment(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Payment with ID 999 not found.",
      });
      expect(mockTransaction.rollback).toHaveBeenCalledTimes(1);
    });

    it("should return 400 if payment ID is invalid", async () => {
      const req = mockRequest({ paymentId: "abc" }, validUpdateData);
      const res = mockResponse();
      await updatePayment(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid payment ID format.",
      });
    });

    // Add more tests for update: no fields provided, invalid amount, db error, invoice status changes, financial statement updates
  });

  // --- Tests for deletePayment ---
  describe("deletePayment", () => {
    const paymentId = 50;
    const mockExistingPayment = {
      id: paymentId,
      InvoiceId: 1,
      PatientId: 10,
      Amount: 50.0,
      PaymentDate: new Date("2024-04-10"),
      isRefund: false,
      destroy: jest.fn().mockResolvedValue(1), // Mock destroy
    };

    it("should delete payment, update invoice, commit transaction, and return 204", async () => {
      db.Payment.findByPk.mockResolvedValueOnce(mockExistingPayment);
      db.Payment.findAll.mockResolvedValueOnce([]); // No payments left after deletion
      // Assume invoice PatientPortion is 100

      const req = mockRequest({ paymentId: paymentId.toString() });
      const res = mockResponse();

      await deletePayment(req, res);

      expect(db.sequelize.transaction).toHaveBeenCalledTimes(1);
      expect(db.Payment.findByPk).toHaveBeenCalledWith(paymentId, {
        transaction: mockTransaction,
      });
      expect(mockExistingPayment.destroy).toHaveBeenCalledWith({
        transaction: mockTransaction,
      });
      expect(db.Payment.findAll).toHaveBeenCalledWith({
        attributes: ["Amount", "isRefund"],
        where: {
          InvoiceId: mockExistingPayment.InvoiceId,
          TransactionStatus: "completed",
        },
        raw: true,
        transaction: mockTransaction,
      });
      expect(db.Invoice.update).toHaveBeenCalledWith(
        { AmountPaid: "0.00", Status: "pending" }, // Invoice back to pending
        {
          where: { id: mockExistingPayment.InvoiceId },
          transaction: mockTransaction,
        }
      );
      // Ideally, check updateFinancialStatementForMonth call(s) here
      expect(mockTransaction.commit).toHaveBeenCalledTimes(1);
      expect(mockTransaction.rollback).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it("should return 404 if payment to delete is not found", async () => {
      db.Payment.findByPk.mockResolvedValue(null);
      const req = mockRequest({ paymentId: "999" });
      const res = mockResponse();
      await deletePayment(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Payment with ID 999 not found.",
      });
      expect(mockTransaction.rollback).toHaveBeenCalledTimes(1);
    });

    it("should return 400 if payment ID is invalid", async () => {
      const req = mockRequest({ paymentId: "abc" });
      const res = mockResponse();
      await deletePayment(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid payment ID format.",
      });
    });

    // Add more tests for delete: db error, invoice status changes, financial statement updates
  });
});
