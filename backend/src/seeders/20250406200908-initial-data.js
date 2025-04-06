"use strict";
// Import models (adjust path ../ if your models are in src/models)
const db = require("../models"); // Assumes index.js is in ../models
const { Op } = require("sequelize"); // Import operators if needed for queries

// Note: Direct use of models (db.KrollPatient.create) is often easier in seeders
// than queryInterface, especially for handling associations.
// We will primarily use model methods here.

// Helper for date calculations
const {
  addDays,
  subDays,
  startOfMonth,
  endOfMonth,
  parseISO,
} = require("date-fns");

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log("Starting database seeding (Sequelize)...");
    const transaction = await queryInterface.sequelize.transaction(); // Use transaction

    try {
      // --- Clear Existing Data (in reverse dependency order) ---
      console.log("Clearing existing data...");
      await db.Payment.destroy({
        where: {},
        truncate: true,
        cascade: true,
        transaction,
      });
      await db.Invoice.destroy({
        where: {},
        truncate: true,
        cascade: true,
        transaction,
      });
      await db.KrollRxPrescriptionPlanAdj.destroy({
        where: {},
        truncate: true,
        cascade: true,
        transaction,
      });
      await db.KrollRxPrescriptionPlan.destroy({
        where: {},
        truncate: true,
        cascade: true,
        transaction,
      });
      await db.KrollRxPrescription.destroy({
        where: {},
        truncate: true,
        cascade: true,
        transaction,
      });
      await db.KrollPatientPlan.destroy({
        where: {},
        truncate: true,
        cascade: true,
        transaction,
      });
      await db.KrollPlanSub.destroy({
        where: {},
        truncate: true,
        cascade: true,
        transaction,
      });
      await db.KrollPlan.destroy({
        where: {},
        truncate: true,
        cascade: true,
        transaction,
      });
      await db.KrollDrugPackInvHist.destroy({
        where: {},
        truncate: true,
        cascade: true,
        transaction,
      });
      await db.KrollDrugPack.destroy({
        where: {},
        truncate: true,
        cascade: true,
        transaction,
      });
      await db.KrollDrug.destroy({
        where: {},
        truncate: true,
        cascade: true,
        transaction,
      });
      await db.KrollDrugMix.destroy({
        where: {},
        truncate: true,
        cascade: true,
        transaction,
      }); // Assuming no dependents yet
      await db.KrollPatientPhone.destroy({
        where: {},
        truncate: true,
        cascade: true,
        transaction,
      });
      await db.KrollPatientAlg.destroy({
        where: {},
        truncate: true,
        cascade: true,
        transaction,
      });
      await db.KrollPatientCnd.destroy({
        where: {},
        truncate: true,
        cascade: true,
        transaction,
      });
      await db.KrollPatientCom.destroy({
        where: {},
        truncate: true,
        cascade: true,
        transaction,
      });
      await db.MonthlyStatement.destroy({
        where: {},
        truncate: true,
        cascade: true,
        transaction,
      });
      await db.FinancialStatement.destroy({
        where: {},
        truncate: true,
        cascade: true,
        transaction,
      });
      await db.KrollPatient.destroy({
        where: {},
        truncate: true,
        cascade: true,
        transaction,
      });
      console.log("Existing data cleared.");

      // --- 1. Create Patients ---
      console.log("Creating patients...");
      const patientsData = [
        {
          LastName: "Trudeau",
          FirstName: "Justin",
          Prov: "ON",
          City: "Ottawa",
          Sex: "M",
          Language: "E",
          Birthday: new Date(1971, 11, 25),
          Address1: "123 Sussex Drive",
          Postal: "K1A0A3",
          Country: "Canada",
          Code: "PAT1001",
          HasCondition: true,
          HasAllergy: false,
        },
        {
          LastName: "Horgan",
          FirstName: "John",
          Prov: "BC",
          City: "Victoria",
          Sex: "M",
          Language: "E",
          Birthday: new Date(1959, 7, 13),
          Address1: "501 Belleville St",
          Postal: "V8V1X4",
          Country: "Canada",
          Code: "PAT1002",
          HasCondition: false,
          HasAllergy: true,
        },
        {
          LastName: "Legault",
          FirstName: "Francois",
          Prov: "QC",
          City: "Montreal",
          Sex: "M",
          Language: "F",
          Birthday: new Date(1957, 4, 26),
          Address1: "1045 Rue de la Gauchetière",
          Postal: "H3B2H4",
          Country: "Canada",
          Code: "PAT1003",
          HasCondition: false,
          HasAllergy: false,
        },
      ];

      const createdPatients = [];
      for (let i = 0; i < patientsData.length; i++) {
        const pData = patientsData[i];
        const patient = await db.KrollPatient.create(
          {
            LastName: pData.LastName,
            FirstName: pData.FirstName,
            Prov: pData.Prov,
            City: pData.City,
            Sex: pData.Sex,
            Language: pData.Language,
            Birthday: pData.Birthday,
            Address1: pData.Address1,
            Postal: pData.Postal,
            Country: pData.Country,
            CreatedOn: new Date(),
            LastChanged: new Date(),
            Active: true,
            Code: pData.Code,
            // Add other necessary non-null fields if defaults aren't set in model
          },
          { transaction }
        );

        // Add Phone
        await db.KrollPatientPhone.create(
          {
            PatID: patient.id,
            Description: "Home",
            Phone: `555-010${i}`,
            LongDistance: false,
            Type: 0,
            status: "active",
            // DateCreated/DateChanged managed by timestamps: true / mapping in model
          },
          { transaction }
        );

        // Add Comment
        await db.KrollPatientCom.create(
          {
            PatID: patient.id,
            Topic: "General",
            Created: new Date(), // Keep if distinct from createdAt
            Changed: new Date(), // Keep if distinct from updatedAt
            CommentPlainText: "Patient preferences noted in file.",
            ShowOnRx: true,
          },
          { transaction }
        );

        // Add Condition conditionally
        if (pData.HasCondition) {
          await db.KrollPatientCnd.create(
            {
              PatID: patient.id,
              Code: "E11.9",
              Comment: "Type 2 Diabetes",
              Seq: 1,
              Source: 1,
              DateAdded: new Date(), // Keep if distinct from createdAt
            },
            { transaction }
          );
        }
        // Add Allergy conditionally
        if (pData.HasAllergy) {
          await db.KrollPatientAlg.create(
            {
              PatID: patient.id,
              Code: "PNCI",
              Comment: "Penicillin",
              Seq: 1,
              Source: 1,
              DateAdded: new Date(), // Keep if distinct from createdAt
              CodeType: 1,
            },
            { transaction }
          );
        }
        createdPatients.push(patient); // Store the created Sequelize instance
      }
      console.log(`Created ${createdPatients.length} patients.`);

      // --- 2. Create Drugs & Drug Packs ---
      console.log("Creating drugs and drug packs...");
      const drugsData = [
        {
          BrandName: "Ozempic",
          GenericName: "Semaglutide",
          DIN: "02471464",
          Schedule: "Rx",
          Form: "Injection",
          Strength: "1mg/dose",
          Manufacturer: "Novo Nordisk",
          Comment: "For type 2 diabetes, weight management",
        },
        {
          BrandName: "Tylenol",
          GenericName: "Acetaminophen",
          DIN: "00559407",
          Schedule: "OTC",
          Form: "Tablet",
          Strength: "500mg",
          Manufacturer: "Johnson & Johnson",
          Comment: "For pain and fever relief",
        },
      ];
      const createdDrugs = [];
      for (const dData of drugsData) {
        const drug = await db.KrollDrug.create(
          {
            BrandName: dData.BrandName,
            GenericName: dData.GenericName,
            DIN: dData.DIN,
            Active: true,
            Schedule: dData.Schedule,
            Form: dData.Form,
            Strength: dData.Strength,
            Manufacturer: dData.Manufacturer,
            Comment: dData.Comment,
            Created: new Date(), // Keep if distinct
            Changed: new Date(), // Keep if distinct
          },
          { transaction }
        );

        const isAcetaminophen = drug.GenericName === "Acetaminophen";
        await db.KrollDrugPack.create(
          {
            DrgID: drug.id,
            QuickCode: `${drug.DIN.substring(0, 5)}PK`,
            Active: true,
            PackSize: isAcetaminophen ? "100.0" : "1.0", // Use string for Decimal
            PackUnit: isAcetaminophen ? "Tablet" : "Pen",
            OnHandQty: isAcetaminophen ? "500.0" : "10.0", // Use string for Decimal
            AcqCost: isAcetaminophen ? "5.50" : "150.75", // Use string for Decimal
            SellingCost: isAcetaminophen ? "10.00" : "250.00", // Use string for Decimal
            Created: new Date(), // Keep if distinct
            Changed: new Date(), // Keep if distinct
          },
          { transaction }
        );
        createdDrugs.push(drug);
      }
      console.log(`Created ${createdDrugs.length} drugs with packs.`);

      // --- 3. Create Plans & SubPlans ---
      console.log("Creating plans and subplans...");
      const plansData = [
        {
          PlanCode: "OHIP",
          Description: "Ontario Health Insurance Plan",
          Prov: "ON",
          IsProvincialPlan: true,
          PharmacyID: "ONPHA001",
          BIN: "610502",
        },
        {
          PlanCode: "BCMSP",
          Description: "BC Medical Services Plan",
          Prov: "BC",
          IsProvincialPlan: true,
          PharmacyID: "BCPHA001",
          BIN: "610402",
        },
        {
          PlanCode: "RAMQ",
          Description: "Régie de l'assurance maladie du Québec",
          Prov: "QC",
          IsProvincialPlan: true,
          PharmacyID: "QCPHA001",
          BIN: "610602",
        },
      ];
      const subplanCodes = ["STANDARD", "PREMIUM"];
      const createdPlans = [];

      for (const pData of plansData) {
        const plan = await db.KrollPlan.create(
          {
            PlanCode: pData.PlanCode,
            Description: pData.Description,
            Prov: pData.Prov,
            IsProvincialPlan: pData.IsProvincialPlan,
            PharmacyID: pData.PharmacyID,
            BIN: pData.BIN,
            AlternatePayee: false,
            CheckCoverage: true,
            IsRealTime: true,
          },
          { transaction }
        );

        for (let i = 0; i < subplanCodes.length; i++) {
          const code = subplanCodes[i];
          await db.KrollPlanSub.create(
            {
              PlanID: plan.id,
              SubPlanCode: code,
              Description: `${code} Coverage (${plan.Prov})`,
              DefSubPlan: code === "STANDARD",
              CarrierIDRO: false,
              GroupRO: false,
              ClientRO: false,
              CPHARO: false,
              RelRO: false,
              ExpiryRO: false,
              CarrierIDReq: plan.Prov !== "ON",
              GroupReq: true,
              ClientReq: true,
              CPHAReq: false,
              RelReq: true,
              ExpiryReq: false,
              DeductReq: false,
              BirthReq: true,
              Active: true,
              AllowManualBilling: true,
            },
            { transaction }
          );
        }
        createdPlans.push(plan);
      }
      console.log(`Created ${createdPlans.length} plans with subplans.`);

      // --- 4. Link Patients to Plans ---
      console.log("Linking patients to plans...");
      const createdPatientPlans = [];
      for (let i = 0; i < createdPatients.length; i++) {
        const patient = createdPatients[i];
        // Find matching plan in memory (createdPlans) or query
        const matchingPlan = createdPlans.find((p) => p.Prov === patient.Prov);
        if (matchingPlan) {
          // Find subplan by querying the DB now that it exists
          const subplan = await db.KrollPlanSub.findOne({
            where: {
              PlanID: matchingPlan.id,
              SubPlanCode: subplanCodes[i % subplanCodes.length], // Match python logic
            },
            transaction,
          });
          if (subplan) {
            const patientPlan = await db.KrollPatientPlan.create(
              {
                PatID: patient.id,
                PlanID: matchingPlan.id,
                SubPlanID: subplan.id,
                Sequence: 1,
                Cardholder: `${patient.FirstName} ${patient.LastName}`,
                CarrierID: matchingPlan.Prov === "BC" ? "CARR01" : null,
                GroupID: `GRP${patient.Prov}001`,
                ClientID: `${patient.LastName.toUpperCase()}${
                  patient.FirstName[0]
                }${patient.Birthday.getFullYear().toString().slice(-2)}`,
                Rel: "01",
                Birthday: patient.Birthday,
                PatSex: patient.Sex,
                FirstName: patient.FirstName,
                LastName: patient.LastName,
                AlwaysUseInRx: true,
                Deleted: false,
              },
              { transaction }
            );
            createdPatientPlans.push(patientPlan);
          } else {
            console.warn(
              `Subplan ${
                subplanCodes[i % subplanCodes.length]
              } not found for Plan ID ${matchingPlan.id}`
            );
          }
        } else {
          console.warn(
            `No matching plan found for patient ${patient.id} in province ${patient.Prov}`
          );
        }
      }
      console.log(`Linked ${createdPatientPlans.length} patient plans.`);

      // --- 5. Create Prescriptions, Adjudication, Invoices, Payments (Deterministic) ---
      console.log("Creating deterministic prescriptions chain...");
      let totalRevenue = 0.0;
      let totalInsurancePayments = 0.0;
      let totalPatientPayments = 0.0;
      let totalOutstandingPatientPortion = 0.0;

      let currentFillDate = new Date(2025, 2, 1); // Month is 0-indexed (2 = March)
      let baseRxNum = 10000;
      let prescriptionCounter = 0;
      let paymentCounter = 0;
      const paymentMethods = ["credit", "debit", "cash"];

      const rxScenarios = [
        { patientIdx: 0, drugIdx: 0, shouldPay: true },
        { patientIdx: 0, drugIdx: 1, shouldPay: false },
        { patientIdx: 1, drugIdx: 0, shouldPay: true },
        { patientIdx: 2, drugIdx: 1, shouldPay: false },
        { patientIdx: 2, drugIdx: 0, shouldPay: true },
      ];

      for (const scenario of rxScenarios) {
        const patient = createdPatients[scenario.patientIdx];
        const drug = createdDrugs[scenario.drugIdx];
        const isOzempic = drug.BrandName === "Ozempic";

        // Get related data (safer to query now)
        const drugPack = await db.KrollDrugPack.findOne({
          where: { DrgID: drug.id },
          transaction,
        });
        const patientPlan = await db.KrollPatientPlan.findOne({
          where: { PatID: patient.id },
          include: [
            { model: db.KrollPlan, as: "plan" },
            { model: db.KrollPlanSub, as: "subplan" },
          ],
          transaction,
        }); // Include associated plan/subplan

        if (!drugPack) {
          console.warn(
            `DrugPack not found for Drug ID ${drug.id}. Skipping Rx.`
          );
          continue;
        }

        const dispQty = isOzempic ? 1.0 : 90.0;
        const daysSupply = isOzempic ? 28 : 90;

        // Pricing Simulation (use parseFloat for calculations)
        const baseCost = parseFloat(drugPack.AcqCost);
        const packSize = parseFloat(drugPack.PackSize);
        // Cost per unit might need adjustment based on how PackSize relates to DispQty Unit
        const costPerDispUnit = baseCost / (isOzempic ? 1 : packSize); // Simple assumption
        const aac = parseFloat((costPerDispUnit * dispQty).toFixed(2));
        const markupPercentage = 0.1;
        const markup = parseFloat((aac * markupPercentage).toFixed(2));
        const fee = 12.0;
        const totalCharge = parseFloat((aac + markup + fee).toFixed(2));

        const rxNum = baseRxNum + prescriptionCounter++;

        // Create Prescription
        const prescription = await db.KrollRxPrescription.create(
          {
            PatID: patient.id,
            DrgID: drug.id,
            OrigRxNum: rxNum,
            RxNum: rxNum,
            Init: "SYS",
            UserInit: "SEED",
            FillDate: currentFillDate,
            WrittenDate: subDays(currentFillDate, 2),
            FirstFillDate: currentFillDate,
            LastFillDate: currentFillDate,
            DispQty: dispQty.toString(),
            DaysSupply: daysSupply,
            AuthQty: (dispQty * 3).toString(),
            RemQty: (dispQty * 2).toString(),
            Labels: 1,
            ProductSelection: 1,
            SIG: `Take ${isOzempic ? "1 injection weekly" : "1 tablet daily"}`,
            DIN: drug.DIN,
            PackSize: drugPack.PackSize, // Keep original packsize info
            AAC: aac.toFixed(2),
            Cost: aac.toFixed(2),
            Markup: markup.toFixed(2),
            Fee: fee.toFixed(2),
            MixFee: "0.00",
            SSCFee: "0.00",
            PriceDiscount: "0.00",
            DeductDiscount: "0.00",
            ManualPrice: false,
            Status: 1,
            AdjState: 0,
            Inactive: false,
            Charged: true,
          },
          { transaction }
        );

        // Simulate Adjudication
        let insurancePays = 0.0;
        let adjState = 0;
        let resultCode = "N/A";
        let patientPortion = totalCharge;

        if (patientPlan && patientPlan.plan && patientPlan.subplan) {
          // Check associated data exists
          if (patientPlan.plan.IsProvincialPlan) {
            if (isOzempic) {
              insurancePays = parseFloat((totalCharge * 0.75).toFixed(2));
              adjState = 1;
              resultCode = "PAY";
            } else {
              insurancePays = 0.0;
              adjState = 3;
              resultCode = "REJ";
            }
          }
          patientPortion = parseFloat((totalCharge - insurancePays).toFixed(2));

          // Create RxPlan
          const rxPlan = await db.KrollRxPrescriptionPlan.create(
            {
              RxNum: prescription.RxNum, // Link via unique RxNum
              PatPlnID: patientPlan.id,
              Seq: 1,
              Pays: insurancePays.toFixed(2),
              TranType: 1,
              AdjState: adjState,
              SubPlanCode: patientPlan.subplan.SubPlanCode,
              IsRT: true,
              AdjDate: addDays(currentFillDate, 1), // Adjudicate next day
            },
            { transaction }
          );

          // Create RxPlanAdj
          await db.KrollRxPrescriptionPlanAdj.create(
            {
              RxPlnID: rxPlan.id,
              TS: addDays(currentFillDate, 1), // Timestamp of adj
              ResultCode: resultCode,
              AdjDate: addDays(currentFillDate, 1),
              Cost: aac.toFixed(2),
              Markup: markup.toFixed(2),
              Fee: fee.toFixed(2),
              MixFee: "0.00",
              SSCFee: "0.00",
              PlanPays: insurancePays.toFixed(2),
              SubCost: aac.toFixed(2),
              SubMarkup: markup.toFixed(2),
              SubFee: fee.toFixed(2),
              SubMixFee: "0.00",
              SubSSCFee: "0.00",
              PrevPaid: "0.00",
              AdjudicationLevel: 1,
              RxNum: prescription.RxNum, // Keep RxNum maybe for reporting
              Copay: patientPortion.toFixed(2),
              Deductible: "0.00",
              CoInsurance: "0.00",
            },
            { transaction }
          );

          // Update prescription adj state
          prescription.AdjState = adjState;
          await prescription.save({ transaction });
        } else {
          console.warn(
            `Patient Plan or related Plan/SubPlan not found for patient ${patient.id}. Skipping adjudication.`
          );
          patientPortion = totalCharge; // No insurance coverage
          prescription.AdjState = 0; // Update prescription adj state
          await prescription.save({ transaction });
        }

        // Create Invoice
        const invoice = await db.Invoice.create(
          {
            PatientId: patient.id,
            RxId: prescription.id,
            InvoiceDate: currentFillDate,
            DueDate: addDays(currentFillDate, 30),
            Description: `Rx #${prescription.RxNum} ${drug.BrandName}`,
            Amount: totalCharge.toFixed(2),
            AmountPaid: "0.00",
            InsuranceCoveredAmount: insurancePays.toFixed(2),
            PatientPortion: patientPortion.toFixed(2),
            Status: "pending",
          },
          { transaction }
        );

        // Create Payment (Deterministic)
        let paymentAmount = 0.0;
        if (patientPortion > 0 && scenario.shouldPay) {
          paymentAmount = patientPortion;
          const paymentMethod =
            paymentMethods[paymentCounter++ % paymentMethods.length];
          await db.Payment.create(
            {
              PatientId: patient.id,
              InvoiceId: invoice.id,
              Amount: paymentAmount.toFixed(2),
              PaymentDate: addDays(currentFillDate, 7),
              PaymentMethod: paymentMethod,
              ReferenceNumber: `PAY${invoice.id}DET`,
              TransactionStatus: "completed",
              Notes: "Seed payment (Deterministic)",
            },
            { transaction }
          );
          invoice.AmountPaid = paymentAmount.toFixed(2);
          invoice.Status = "paid";
          await invoice.save({ transaction });
        }

        // Update financial aggregates
        totalRevenue += totalCharge;
        totalInsurancePayments += insurancePays;
        if (paymentAmount > 0) {
          totalPatientPayments += paymentAmount;
        } else {
          totalOutstandingPatientPortion += patientPortion;
        }

        // Increment fill date
        currentFillDate = addDays(currentFillDate, 7);
      }
      console.log("Created deterministic prescriptions chain.");

      // --- 6. Generate Monthly Statements ---
      console.log("Generating monthly statements...");
      const statementDate = new Date(2025, 2, 31); // March 31, 2025
      const startDate = startOfMonth(statementDate); // March 1, 2025
      const endDate = endOfMonth(statementDate); // March 31, 2025

      for (const patient of createdPatients) {
        const patientInvoices = await db.Invoice.findAll({
          where: {
            PatientId: patient.id,
            InvoiceDate: { [Op.between]: [startDate, endDate] },
          },
          transaction,
        });
        const patientPayments = await db.Payment.findAll({
          where: {
            PatientId: patient.id,
            PaymentDate: { [Op.between]: [startDate, endDate] },
          },
          transaction,
        });

        const openingBalance = 0.0; // Assuming 0 for simplicity in seed
        const charges = patientInvoices.reduce(
          (sum, inv) => sum + parseFloat(inv.PatientPortion),
          0.0
        );
        const paymentsReceived = patientPayments.reduce(
          (sum, pay) => sum + parseFloat(pay.Amount),
          0.0
        );
        const closingBalance = openingBalance + charges - paymentsReceived;

        await db.MonthlyStatement.create(
          {
            PatientId: patient.id,
            StatementDate: statementDate,
            StartDate: startDate,
            EndDate: endDate,
            OpeningBalance: openingBalance.toFixed(2),
            TotalCharges: charges.toFixed(2),
            TotalPayments: paymentsReceived.toFixed(2),
            ClosingBalance: closingBalance.toFixed(2),
          },
          { transaction }
        );
      }
      console.log("Generated monthly statements.");

      // --- 7. Generate Financial Statement ---
      console.log("Generating financial statement...");
      await db.FinancialStatement.create(
        {
          StatementDate: statementDate,
          StartDate: startDate,
          EndDate: endDate,
          TotalRevenue: totalRevenue.toFixed(2),
          InsurancePayments: totalInsurancePayments.toFixed(2),
          PatientPayments: totalPatientPayments.toFixed(2),
          OutstandingBalance: totalOutstandingPatientPortion.toFixed(2),
        },
        { transaction }
      );
      console.log("Generated financial statement.");

      // If we reach here, commit the transaction
      await transaction.commit();
      console.log("Database seeding completed successfully! (Sequelize)");
    } catch (error) {
      // If any error occurred, rollback the transaction
      await transaction.rollback();
      console.error("Error seeding database (Sequelize):", error);
      // It might be helpful to log specific parts of the error
      if (error.original) {
        console.error("Original Error:", error.original);
      }
    }
  },

  async down(queryInterface, Sequelize) {
    console.log("Reverting seed data (Sequelize)...");
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Delete in reverse order of creation / dependency
      await db.Payment.destroy({
        where: {},
        truncate: true,
        cascade: true,
        transaction,
      });
      await db.Invoice.destroy({
        where: {},
        truncate: true,
        cascade: true,
        transaction,
      });
      await db.KrollRxPrescriptionPlanAdj.destroy({
        where: {},
        truncate: true,
        cascade: true,
        transaction,
      });
      await db.KrollRxPrescriptionPlan.destroy({
        where: {},
        truncate: true,
        cascade: true,
        transaction,
      });
      await db.KrollRxPrescription.destroy({
        where: {},
        truncate: true,
        cascade: true,
        transaction,
      });
      await db.KrollPatientPlan.destroy({
        where: {},
        truncate: true,
        cascade: true,
        transaction,
      });
      await db.KrollPlanSub.destroy({
        where: {},
        truncate: true,
        cascade: true,
        transaction,
      });
      await db.KrollPlan.destroy({
        where: {},
        truncate: true,
        cascade: true,
        transaction,
      });
      await db.KrollDrugPackInvHist.destroy({
        where: {},
        truncate: true,
        cascade: true,
        transaction,
      });
      await db.KrollDrugPack.destroy({
        where: {},
        truncate: true,
        cascade: true,
        transaction,
      });
      await db.KrollDrug.destroy({
        where: {},
        truncate: true,
        cascade: true,
        transaction,
      });
      await db.KrollDrugMix.destroy({
        where: {},
        truncate: true,
        cascade: true,
        transaction,
      });
      await db.KrollPatientPhone.destroy({
        where: {},
        truncate: true,
        cascade: true,
        transaction,
      });
      await db.KrollPatientAlg.destroy({
        where: {},
        truncate: true,
        cascade: true,
        transaction,
      });
      await db.KrollPatientCnd.destroy({
        where: {},
        truncate: true,
        cascade: true,
        transaction,
      });
      await db.KrollPatientCom.destroy({
        where: {},
        truncate: true,
        cascade: true,
        transaction,
      });
      await db.MonthlyStatement.destroy({
        where: {},
        truncate: true,
        cascade: true,
        transaction,
      });
      await db.FinancialStatement.destroy({
        where: {},
        truncate: true,
        cascade: true,
        transaction,
      });
      await db.KrollPatient.destroy({
        where: {},
        truncate: true,
        cascade: true,
        transaction,
      });

      await transaction.commit();
      console.log("Seed data reverted successfully.");
    } catch (error) {
      await transaction.rollback();
      console.error("Error reverting seed data:", error);
    }
  },
};
