// src/controllers/patientController.js
const db = require("../models");
const { KrollPatient } = db; // Destructure the KrollPatient model

// Get all patients
exports.getAllPatients = async (req, res) => {
  try {
    const patients = await KrollPatient.findAll({
      // Optional: Add attributes or includes if needed later
      // attributes: ['id', 'FirstName', 'LastName', 'Code'],
      // include: [{ model: db.KrollPatientPhone, as: 'patient_phones' }]
    });
    res.status(200).json(patients);
  } catch (error) {
    console.error("Error fetching patients:", error);
    res
      .status(500)
      .json({ message: "Error fetching patients", error: error.message });
  }
};

// Get a single patient by ID
exports.getPatientById = async (req, res) => {
  try {
    const patientId = parseInt(req.params.id, 10); // Get ID from URL parameter
    if (isNaN(patientId)) {
      return res.status(400).json({ message: "Invalid patient ID format." });
    }

    const patient = await KrollPatient.findByPk(patientId, {
      // Optional: Include related data if needed
      // include: [
      //   { model: db.KrollPatientPhone, as: 'patient_phones' },
      //   { model: db.KrollPatientPlan, as: 'patient_plans' }
      // ]
    });

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }
    res.status(200).json(patient);
  } catch (error) {
    console.error(`Error fetching patient with ID ${req.params.id}:`, error);
    res
      .status(500)
      .json({ message: "Error fetching patient", error: error.message });
  }
};

// Get Patient Account Statement (Prescriptions, Balances) for image 1
exports.getPatientAccountStatement = async (req, res) => {
  try {
    const patientId = parseInt(req.params.id, 10);
    if (isNaN(patientId)) {
      return res.status(400).json({ message: "Invalid patient ID format." });
    }

    // 1. Fetch Patient
    const patient = await KrollPatient.findByPk(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // 2. Fetch Prescriptions with related Drug, Invoice, and Payments
    const prescriptions = await db.KrollRxPrescription.findAll({
      where: { PatID: patientId },
      include: [
        {
          model: db.KrollDrug,
          as: "drug",
          attributes: ["BrandName"], // Only need the drug name
        },
        {
          model: db.Invoice,
          as: "invoice",
          include: [
            {
              model: db.Payment,
              as: "payments",
              attributes: ["Amount"], // Only need amount for balance calculation
            },
          ],
        },
      ],
      order: [["FillDate", "DESC"]], // Order by fill date, newest first
    });

    // 3. Calculate Balances
    let totalPatientBalance = 0;
    const statementLines = prescriptions
      .map((rx) => {
        if (!rx.invoice) {
          // Handle cases where an invoice might not exist for an Rx yet
          console.warn(`Invoice missing for RxNum: ${rx.RxNum}`);
          return null; // Skip this prescription in the statement
        }

        const invoice = rx.invoice;
        const totalPaidByPatient = invoice.payments.reduce(
          (sum, payment) => sum + parseFloat(payment.Amount || 0),
          0
        );

        // Balance for this specific prescription (patient portion minus what they've paid)
        const lineBalance =
          parseFloat(invoice.PatientPortion || 0) - totalPaidByPatient;

        totalPatientBalance += lineBalance;

        return {
          RxNum: rx.RxNum,
          TherapyName: rx.drug ? rx.drug.BrandName : "Unknown Drug", // Handle missing drug association
          Balance: lineBalance.toFixed(2),
          // Add other fields from rx or invoice if needed for the UI
          // e.g., FillDate: rx.FillDate,
          // e.g., InvoiceId: invoice.id
        };
      })
      .filter((line) => line !== null); // Remove null entries where invoice was missing

    // 4. Format Response
    const response = {
      patientDetails: {
        // Include necessary patient details for the header
        id: patient.id,
        FirstName: patient.FirstName,
        LastName: patient.LastName,
        // Add other fields like Salutation, Gender, Birthday, Language, Height, Weight if needed
        Salutation: patient.Salutation,
        Gender: patient.Sex,
        Birthday: patient.Birthday,
        Language: patient.Language,
        Height: patient.Height,
        Weight: patient.Weight,
      },
      TotalBalance: totalPatientBalance.toFixed(2),
      statementLines: statementLines,
      // Add pagination info if needed later
      // totalResults: statementLines.length,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(
      `Error fetching account statement for patient ID ${req.params.id}:`,
      error
    );
    res.status(500).json({
      message: "Error fetching account statement",
      error: error.message,
    });
  }
};

// Get Details for a Specific Prescription (for Image 2)
exports.getPrescriptionDetails = async (req, res) => {
  try {
    const patientId = parseInt(req.params.patientId, 10);
    const rxNum = parseInt(req.params.rxNum, 10);

    if (isNaN(patientId) || isNaN(rxNum)) {
      return res
        .status(400)
        .json({ message: "Invalid patient or prescription number format." });
    }

    // 1. Fetch the Core Prescription and its Invoice
    const prescription = await db.KrollRxPrescription.findOne({
      where: { RxNum: rxNum, PatID: patientId }, // Ensure it belongs to the correct patient
      include: [
        {
          model: db.KrollDrug,
          as: "drug",
          attributes: ["BrandName"],
        },
        {
          model: db.Invoice,
          as: "invoice",
          required: false, // An invoice might not exist yet
        },
      ],
    });

    if (!prescription) {
      return res
        .status(404)
        .json({ message: "Prescription not found for this patient." });
    }

    const invoiceId = prescription.invoice ? prescription.invoice.id : null;

    // 2. Fetch Direct Patient Payments for the Invoice
    const patientPayments = invoiceId
      ? await db.Payment.findAll({
          where: { InvoiceId: invoiceId },
          order: [["PaymentDate", "ASC"]],
        })
      : [];

    // 3. Fetch Insurance Adjudications
    // KrollRxPrescriptionPlan links RxNum to KrollPatientPlan (which has plan details)
    // KrollRxPrescriptionPlanAdj links KrollRxPrescriptionPlan to adjudication results
    const insuranceAdjudications = await db.KrollRxPrescriptionPlan.findAll({
      where: { RxNum: rxNum },
      include: [
        {
          model: db.KrollPatientPlan,
          as: "patient_plan",
          include: [
            {
              model: db.KrollPlan,
              as: "plan",
              attributes: ["PlanCode", "Description"],
            },
            {
              model: db.KrollPlanSub,
              as: "subplan",
              attributes: ["SubPlanCode", "Description"],
            },
          ],
        },
        {
          model: db.KrollRxPrescriptionPlanAdj,
          as: "plan_adjustments",
          required: true, // Only include RxPlans that have adjustments
        },
      ],
      order: [["AdjDate", "ASC"]], // Order by adjustment date
    });

    // 4. Combine and Format Transactions into a Timeline
    let transactionTimeline = [];

    // Add Patient Payments
    patientPayments.forEach((p) => {
      transactionTimeline.push({
        type: "PatientPayment",
        date: p.PaymentDate,
        amount: parseFloat(p.Amount).toFixed(2),
        paymentMethod: p.PaymentMethod,
        referenceNumber: p.ReferenceNumber,
        refund: p.isRefund, // Use the isRefund flag from the Payment record
        paymentPlan: null, // No plan for direct patient payments
        id: `payment-${p.id}`,
      });
    });

    // Add Insurance Adjudications
    insuranceAdjudications.forEach((rxPlan) => {
      rxPlan.plan_adjustments.forEach((adj) => {
        let planIdentifier = "Unknown Plan";
        if (rxPlan.patient_plan && rxPlan.patient_plan.plan) {
          planIdentifier = `${rxPlan.patient_plan.plan.PlanCode}`;
          if (rxPlan.patient_plan.subplan) {
            planIdentifier += ` (${
              rxPlan.patient_plan.subplan.SubPlanCode || "N/A"
            })`;
          }
        } else if (rxPlan.SubPlanCode) {
          planIdentifier = `Plan Code: ${rxPlan.SubPlanCode}`; // Fallback if patient_plan link fails
        }

        transactionTimeline.push({
          type: "InsuranceAdjudication",
          date: adj.AdjDate || rxPlan.AdjDate, // Use adjustment date, fallback to plan adj date
          amount: parseFloat(adj.PlanPays).toFixed(2),
          paymentMethod: "Insurance", // Or derive from Plan details if needed
          referenceNumber: adj.RefNum || adj.TraceNum, // Use RefNum or TraceNum
          refund: adj.ResultCode !== "PAY", // Consider anything not 'PAY' as potentially non-payment/refund/rejection?
          paymentPlan: planIdentifier,
          id: `adj-${adj.id}`,
        });
      });
    });

    // Sort the combined timeline by date
    transactionTimeline.sort((a, b) => new Date(a.date) - new Date(b.date));

    // 5. Calculate Current Balance for this Prescription
    const totalPaidByPatient = patientPayments.reduce(
      (sum, payment) => sum + parseFloat(payment.Amount || 0),
      0
    );
    const currentPrescriptionBalance = prescription.invoice
      ? parseFloat(prescription.invoice.PatientPortion || 0) -
        totalPaidByPatient
      : 0; // If no invoice, patient portion is 0

    // 6. Format Response
    const response = {
      prescriptionDetails: {
        RxNum: prescription.RxNum,
        TherapyName: prescription.drug
          ? prescription.drug.BrandName
          : "Unknown Drug",
        FillDate: prescription.FillDate,
        TotalCharge: prescription.invoice
          ? parseFloat(prescription.invoice.Amount).toFixed(2)
          : "N/A",
        InsurancePaid: prescription.invoice
          ? parseFloat(prescription.invoice.InsuranceCoveredAmount).toFixed(2)
          : "N/A",
        PatientPortionInitial: prescription.invoice
          ? parseFloat(prescription.invoice.PatientPortion).toFixed(2)
          : "N/A",
        InvoiceId: invoiceId,
      },
      currentBalance: currentPrescriptionBalance.toFixed(2),
      transactionHistory: transactionTimeline,
      // Add pagination for history if needed
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(
      `Error fetching details for RxNum ${req.params.rxNum}:`,
      error
    );
    res.status(500).json({
      message: "Error fetching prescription details",
      error: error.message,
    });
  }
};

// --- Placeholder for future methods ---

// Create a new patient (Example Structure)
// exports.createPatient = async (req, res) => {
//   try {
//     // TODO: Add validation for req.body
//     const newPatient = await KrollPatient.create(req.body);
//     res.status(201).json(newPatient);
//   } catch (error) {
//     console.error('Error creating patient:', error);
//     res.status(500).json({ message: 'Error creating patient', error: error.message });
//   }
// };

// Update a patient (Example Structure)
// exports.updatePatient = async (req, res) => {
//    try {
//      const patientId = parseInt(req.params.id, 10);
//      // TODO: Check if patient exists
//      // TODO: Add validation for req.body
//      const [updated] = await KrollPatient.update(req.body, { where: { id: patientId } });
//      if (updated) {
//          const updatedPatient = await KrollPatient.findByPk(patientId);
//          res.status(200).json(updatedPatient);
//      } else {
//          res.status(404).json({ message: 'Patient not found or no changes made' });
//      }
//    } catch (error) {
//      console.error(`Error updating patient ${req.params.id}:`, error);
//      res.status(500).json({ message: 'Error updating patient', error: error.message });
//    }
// };

// Delete a patient (Example Structure)
// exports.deletePatient = async (req, res) => {
//   try {
//     const patientId = parseInt(req.params.id, 10);
//     const deleted = await KrollPatient.destroy({ where: { id: patientId } });
//     if (deleted) {
//       res.status(204).send(); // No Content
//     } else {
//       res.status(404).json({ message: 'Patient not found' });
//     }
//   } catch (error) {
//     console.error(`Error deleting patient ${req.params.id}:`, error);
//     res.status(500).json({ message: 'Error deleting patient', error: error.message });
//   }
// };
