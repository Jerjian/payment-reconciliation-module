// backend/tests/patientController.test.js

// Import the function to test
const { getPatientById } = require("../src/controllers/patientController");
// Import the db mock (we'll create this next)
const db = require("../src/models"); // Adjust path if models/index.js is elsewhere

// Mock the database models and methods used by getPatientById
jest.mock("../src/models", () => ({
  KrollPatient: {
    findByPk: jest.fn(), // Mock the findByPk method
  },
  // Mock other models if needed for other controller functions
}));

// Mock Express request and response objects for testing controller functions
const mockRequest = (params = {}, body = {}, query = {}) => ({
  params,
  body,
  query,
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res); // For potential future use
  return res;
};

// Test suite for patientController
describe("Patient Controller - getPatientById", () => {
  // Clear mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if patient ID is not a number", async () => {
    const req = mockRequest({ id: "abc" }); // Invalid ID
    const res = mockResponse();

    await getPatientById(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid patient ID format.",
    });
    expect(db.KrollPatient.findByPk).not.toHaveBeenCalled(); // Ensure DB wasn't called
  });

  it("should return 404 if patient is not found", async () => {
    const patientId = 999;
    // Configure the mock findByPk to return null (patient not found)
    db.KrollPatient.findByPk.mockResolvedValue(null);

    const req = mockRequest({ id: patientId.toString() });
    const res = mockResponse();

    await getPatientById(req, res);

    expect(db.KrollPatient.findByPk).toHaveBeenCalledWith(
      patientId,
      expect.any(Object)
    ); // Check it was called with ID
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Patient not found" });
  });

  it("should return 200 and patient data if patient is found", async () => {
    const patientId = 123;
    const mockPatientData = {
      id: patientId,
      FirstName: "Testy",
      LastName: "McTest",
      // Add other fields returned by findByPk
    };
    // Configure the mock findByPk to return the mock data
    db.KrollPatient.findByPk.mockResolvedValue(mockPatientData);

    const req = mockRequest({ id: patientId.toString() });
    const res = mockResponse();

    await getPatientById(req, res);

    expect(db.KrollPatient.findByPk).toHaveBeenCalledWith(
      patientId,
      expect.any(Object)
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockPatientData); // Check if the correct data was sent
  });

  it("should return 500 if there is a database error", async () => {
    const patientId = 500;
    const errorMessage = "Database crashed";
    // Configure the mock findByPk to throw an error
    db.KrollPatient.findByPk.mockRejectedValue(new Error(errorMessage));

    const req = mockRequest({ id: patientId.toString() });
    const res = mockResponse();

    // Mock console.error to prevent logging during tests
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await getPatientById(req, res);

    expect(db.KrollPatient.findByPk).toHaveBeenCalledWith(
      patientId,
      expect.any(Object)
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error fetching patient",
      error: errorMessage,
    });

    consoleErrorSpy.mockRestore(); // Restore console.error
  });
});
