// src/routes/patientRoutes.js
const express = require("express");
const router = express.Router();
const patientController = require("../controllers/patientController");

// Define routes
router.get("/", patientController.getAllPatients); // GET /api/patients
router.get("/:id", patientController.getPatientById); // GET /api/patients/123
router.get(
  "/:id/account-statement",
  patientController.getPatientAccountStatement
); // GET /api/patients/123/account-statement
router.get(
  "/:patientId/prescriptions/:rxNum/details",
  patientController.getPrescriptionDetails
); // GET /api/patients/123/prescriptions/10001/details

// router.post('/', patientController.createPatient);     // POST /api/patients
// router.put('/:id', patientController.updatePatient);   // PUT /api/patients/123
// router.delete('/:id', patientController.deletePatient); // DELETE /api/patients/123

module.exports = router;
