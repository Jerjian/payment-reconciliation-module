const {
  getFinancialStatements,
  getMonthlyStatementsForPatient,
  getMonthlyStatementForPatientByMonth, // Add if testing this specifically
} = require("../src/controllers/statementController");

const db = require("../src/models");
const { Op } = require("sequelize"); // Import Op for checking where clauses

// --- Mocking Dependencies ---

// Mock Date-fns functions
jest.mock("date-fns", () => ({
  startOfMonth: jest.fn(
    (date) => new Date(date.getFullYear(), date.getMonth(), 1)
  ),
  endOfMonth: jest.fn(
    (date) =>
      new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
  ),
  parseISO: jest.fn((str) => new Date(str)), // Basic ISO parse mock
  subMonths: jest.fn((date, amount) => {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() - amount);
    return newDate;
  }),
  format: jest.requireActual("date-fns").format, // Use actual format for convenience
  isValid: jest.fn(() => true), // Assume valid dates by default
}));

// Mock database models
jest.mock("../src/models", () => ({
  sequelize: {
    // Mock helpers used in calculateStatementData
    fn: jest.fn(() => "SUM_FUNCTION"),
    col: jest.fn((colName) => `col(${colName})`),
    literal: jest.fn((str) => `literal(${str})`),
  },
  FinancialStatement: {
    findOne: jest.fn(),
  },
  Invoice: {
    findOne: jest.fn(),
    findAll: jest.fn(),
  },
  Payment: {
    findAll: jest.fn(),
  },
  // MonthlyStatement might be needed if we revert calculateStatementData or test other functions
  MonthlyStatement: {
    findOne: jest.fn(),
  },
  // Include Op mock if necessary, but importing directly is usually better
}));

// Mock Request/Response
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

describe("Statement Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    db.FinancialStatement.findOne.mockResolvedValue(null);
    db.Invoice.findOne.mockResolvedValue({
      totalCharges: 0,
      totalPriorCharges: 0,
    }); // Default sum results
    db.Invoice.findAll.mockResolvedValue([]); // Default empty arrays
    db.Payment.findAll.mockResolvedValue([]); // Default empty arrays
    db.MonthlyStatement.findOne.mockResolvedValue(null);
  });

  // --- Tests for getFinancialStatements ---
  describe("getFinancialStatements", () => {
    const mockStatement = {
      id: 1,
      StatementDate: new Date("2024-03-31T23:59:59.999Z"),
      StartDate: new Date("2024-03-01T00:00:00.000Z"),
      EndDate: new Date("2024-03-31T23:59:59.999Z"),
      TotalRevenue: "1000.00",
      InsurancePayments: "500.00",
      PatientPayments: "300.00",
      OutstandingBalance: "200.00",
    };

    it("should return 200 and statement data when found with year/month query", async () => {
      db.FinancialStatement.findOne.mockResolvedValue(mockStatement);
      const req = mockRequest({}, {}, { year: "2024", month: "3" });
      const res = mockResponse();

      await getFinancialStatements(req, res);

      // Check that findOne was called with correct date range based on mocks
      expect(db.FinancialStatement.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            EndDate: {
              [Op.between]: [
                new Date(2024, 2, 1),
                new Date(2024, 3, 0, 23, 59, 59, 999),
              ],
            },
          },
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockStatement);
    });

    it("should return 200 and statement data when found with startDate query", async () => {
      db.FinancialStatement.findOne.mockResolvedValue(mockStatement);
      const req = mockRequest({}, {}, { startDate: "2024-03-15" });
      const res = mockResponse();

      await getFinancialStatements(req, res);

      // Check that findOne was called with correct date range based on mocks
      expect(db.FinancialStatement.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            EndDate: {
              [Op.between]: [
                new Date(2024, 2, 1),
                new Date(2024, 3, 0, 23, 59, 59, 999),
              ],
            },
          },
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockStatement);
    });

    it("should return 200 and the latest statement when no query params are provided", async () => {
      db.FinancialStatement.findOne.mockResolvedValue(mockStatement);
      const req = mockRequest();
      const res = mockResponse();

      await getFinancialStatements(req, res);

      // Check findOne was called with empty where but correct order
      expect(db.FinancialStatement.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
          order: [["StatementDate", "DESC"]],
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockStatement);
    });

    it("should return 404 if no statement is found for the period", async () => {
      db.FinancialStatement.findOne.mockResolvedValue(null); // Simulate not found
      const req = mockRequest({}, {}, { year: "2023", month: "1" });
      const res = mockResponse();

      await getFinancialStatements(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining("No financial statement found"),
        })
      );
    });

    it("should return 500 if a database error occurs", async () => {
      const errorMsg = "DB Error";
      db.FinancialStatement.findOne.mockRejectedValue(new Error(errorMsg));
      const req = mockRequest({}, {}, { year: "2024", month: "3" });
      const res = mockResponse();
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await getFinancialStatements(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error fetching financial statements",
        error: errorMsg,
      });
      consoleErrorSpy.mockRestore();
    });
  });

  // --- Tests for getMonthlyStatementsForPatient ---
  describe("getMonthlyStatementsForPatient", () => {
    const patientId = 123;

    // Mock data for calculateStatementData dependencies
    const mockPriorCharges = { totalPriorCharges: 50.0 };
    const mockPriorPayments = [{ Amount: 20.0, isRefund: false }]; // Opening balance = 30
    const mockCurrentCharges = { totalCharges: 100.0 };
    const mockCurrentPayments = [{ Amount: 40.0, isRefund: false }]; // Closing balance = 30 + 100 - 40 = 90

    it("should return 200 and calculated statements for the last 12 months", async () => {
      // Setup mocks for the first month calculation (others will repeat this)
      db.Invoice.findOne
        .mockResolvedValueOnce(mockPriorCharges) // For opening balance calculation
        .mockResolvedValueOnce(mockCurrentCharges); // For current month charges
      db.Payment.findAll
        .mockResolvedValueOnce(mockPriorPayments) // For opening balance calculation
        .mockResolvedValueOnce(mockCurrentPayments); // For current month payments

      // Mock console.log to suppress calculation logs during test
      const consoleLogSpy = jest
        .spyOn(console, "log")
        .mockImplementation(() => {});

      const req = mockRequest({ patientId: patientId.toString() });
      const res = mockResponse();

      await getMonthlyStatementsForPatient(req, res);

      // Basic checks - more detailed checks would verify each month's calculation
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
      const responseBody = res.json.mock.calls[0][0];
      expect(Array.isArray(responseBody)).toBe(true);
      expect(responseBody.length).toBe(12); // Check if 12 months were calculated

      // Check structure of the first statement (newest month)
      // Note: The exact dates depend on when the test is run
      expect(responseBody[0]).toEqual(
        expect.objectContaining({
          PatientId: patientId,
          OpeningBalance: "30.00",
          TotalCharges: "100.00",
          TotalPayments: "40.00",
          ClosingBalance: "90.00",
          // StartDate: expect.any(Date),
          // EndDate: expect.any(Date),
          // StatementDate: expect.any(Date),
        })
      );

      // Check that DB calls were made multiple times (12 months * 2 Invoice calls + 12 months * 2 Payment calls)
      expect(db.Invoice.findOne).toHaveBeenCalledTimes(12 * 2);
      expect(db.Payment.findAll).toHaveBeenCalledTimes(12 * 2);
      consoleLogSpy.mockRestore();
    });

    it("should return 400 if patient ID is invalid", async () => {
      const req = mockRequest({ patientId: "invalid" });
      const res = mockResponse();
      await getMonthlyStatementsForPatient(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid patient ID format.",
      });
    });

    it("should return 500 if a database error occurs during calculation", async () => {
      const errorMsg = "DB Error during calc";
      db.Invoice.findOne.mockRejectedValue(new Error(errorMsg)); // Simulate error during calculation
      const req = mockRequest({ patientId: patientId.toString() });
      const res = mockResponse();
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const consoleLogSpy = jest
        .spyOn(console, "log")
        .mockImplementation(() => {});

      await getMonthlyStatementsForPatient(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error calculating monthly statements",
        error: errorMsg,
      });
      consoleErrorSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });
  });

  // Add tests for getMonthlyStatementForPatientByMonth if needed
});
