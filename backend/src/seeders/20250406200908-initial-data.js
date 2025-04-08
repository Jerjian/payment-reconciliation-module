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
  format,
  subMonths,
} = require("date-fns");

// Helper function to simulate adjudication for a SINGLE plan
function simulateSinglePlanAdjudication(
  planDetails,
  currentCharge,
  drugDetails
) {
  let insurancePays = 0.0;
  let adjState = 3; // Default to Rejected
  let resultCode = "REJ";

  if (!planDetails || currentCharge <= 0) {
    return { insurancePays, adjState, resultCode };
  }

  const isProvincial = planDetails.plan?.IsProvincialPlan;
  const isOzempic = drugDetails.BrandName === "Ozempic";
  const isTylenol = drugDetails.GenericName === "Acetaminophen";

  // Simple simulation rules:
  // Provincial: Covers 75% of Ozempic, 0% of Tylenol/Lipitor
  // Private: Covers 80% of anything *except* Tylenol (which it covers 50% of)

  if (isProvincial) {
    if (isOzempic) {
      insurancePays = Math.min(
        currentCharge,
        parseFloat((drugDetails.totalCharge * 0.75).toFixed(2))
      ); // Pay up to 75% of ORIGINAL charge, but no more than current charge
      adjState = 1; // Paid
      resultCode = "PAY";
    }
    // Provincial pays 0 for others in this sim
  } else {
    // Private Plan
    let coveragePercent = 0.8;
    if (isTylenol) {
      coveragePercent = 0.5;
    }
    insurancePays = Math.min(
      currentCharge,
      parseFloat((drugDetails.totalCharge * coveragePercent).toFixed(2))
    ); // Pay up to coverage % of ORIGINAL charge
    adjState = 1; // Paid
    resultCode = "PAY";
  }

  // Ensure insurance payment doesn't exceed remaining charge
  insurancePays = Math.max(0, insurancePays); // Cannot pay negative
  if (insurancePays > currentCharge) {
    insurancePays = currentCharge; // Cap payment at what's left
  }

  if (insurancePays <= 0) {
    insurancePays = 0;
    adjState = 3; // If calc results in zero pay, mark as rejected
    resultCode = "REJ";
  }

  return {
    insurancePays: parseFloat(insurancePays.toFixed(2)),
    adjState,
    resultCode,
  };
}

// Helper function to calculate financial statement data for a specific month
async function calculateFinancialStatementForMonth(year, month, transaction) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = endOfMonth(startDate);

  // Use the calculation logic (similar to the controller helper)
  const revenueResult = await db.Invoice.findOne({
    attributes: [
      [db.sequelize.fn("SUM", db.sequelize.col("Amount")), "totalRevenue"],
    ],
    where: { InvoiceDate: { [Op.between]: [startDate, endDate] } },
    transaction,
    raw: true,
  });
  const insuranceResult = await db.Invoice.findOne({
    attributes: [
      [
        db.sequelize.fn("SUM", db.sequelize.col("InsuranceCoveredAmount")),
        "totalInsurance",
      ],
    ],
    where: { InvoiceDate: { [Op.between]: [startDate, endDate] } },
    transaction,
    raw: true,
  });
  // Sum payments considering refunds within the period
  const paymentSumResult = await db.Payment.findAll({
    attributes: ["Amount", "isRefund"],
    where: {
      PaymentDate: { [Op.between]: [startDate, endDate] },
      TransactionStatus: "completed",
    },
    raw: true,
    transaction,
  });
  const totalPatientPayments = paymentSumResult.reduce((sum, p) => {
    const paymentAmount = parseFloat(p.Amount || 0);
    return sum + (p.isRefund ? -paymentAmount : paymentAmount);
  }, 0);

  // Outstanding balance calculation (Simplified: total patient portion minus total paid for invoices *up to* end date)
  const outstandingInvoices = await db.Invoice.findAll({
    attributes: ["PatientPortion", "AmountPaid"],
    where: {
      InvoiceDate: { [Op.lte]: endDate }, // Invoices up to the end of the month
      Status: { [Op.notIn]: ["paid"] }, // Not fully paid
    },
    transaction,
    raw: true,
  });
  const totalOutstanding = outstandingInvoices.reduce((sum, inv) => {
    const patientPortion = parseFloat(inv.PatientPortion || 0);
    const amountPaid = parseFloat(inv.AmountPaid || 0);
    return sum + (patientPortion - amountPaid);
  }, 0.0);

  return {
    StatementDate: endDate,
    StartDate: startDate,
    EndDate: endDate,
    TotalRevenue: parseFloat(revenueResult?.totalRevenue || 0).toFixed(2),
    InsurancePayments: parseFloat(insuranceResult?.totalInsurance || 0).toFixed(
      2
    ),
    PatientPayments: totalPatientPayments.toFixed(2),
    OutstandingBalance: Math.max(0, totalOutstanding).toFixed(2), // Ensure non-negative balance
  };
}

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log(
      "Starting database seeding (Enhanced V2 - Multi-Plan)... DONT FORGET TO UPDATE MODELS FOR NEW FK CONSTRAINTS"
    );
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // --- Clear Existing Data (ensure correct order) ---
      console.log("Clearing existing data...");
      // Start from tables that depend on others
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
      // Finally, the base patient table
      await db.KrollPatient.destroy({
        where: {},
        truncate: true,
        cascade: true,
        transaction,
      });
      console.log("Existing data cleared.");

      // --- 1. Create Patients (More patients) ---
      console.log("Creating patients...");
      const patientsData = [
        // Original 3 with new fields
        {
          Code: "PAT1001",
          LastName: "Trudeau",
          FirstName: "Justin",
          Prov: "ON",
          City: "Ottawa",
          Sex: "M",
          Birthday: new Date(1971, 11, 25),
          HasCondition: true,
          HasAllergy: false,
          Salutation: "Mr.",
          Height: "188cm",
          Weight: "85kg",
        },
        {
          Code: "PAT1002",
          LastName: "Horgan",
          FirstName: "John",
          Prov: "BC",
          City: "Victoria",
          Sex: "M",
          Birthday: new Date(1959, 7, 13),
          HasCondition: false,
          HasAllergy: true,
          Salutation: "Mr.",
          Height: "180cm",
          Weight: "90kg",
        },
        {
          Code: "PAT1003",
          LastName: "Legault",
          FirstName: "Francois",
          Prov: "QC",
          City: "Montreal",
          Sex: "M",
          Birthday: new Date(1957, 4, 26),
          HasCondition: false,
          HasAllergy: false,
          Salutation: "M.",
          Height: "175cm",
          Weight: "80kg",
        },
        // New patients with new fields
        {
          Code: "PAT1004",
          LastName: "Smith",
          FirstName: "Jane",
          Prov: "ON",
          City: "Toronto",
          Sex: "F",
          Birthday: new Date(1985, 5, 10),
          HasCondition: false,
          HasAllergy: false,
          Salutation: "Ms.",
          Height: "165cm",
          Weight: "65kg",
        },
        {
          Code: "PAT1005",
          LastName: "Jones",
          FirstName: "David",
          Prov: "AB",
          City: "Calgary",
          Sex: "M",
          Birthday: new Date(1992, 8, 22),
          HasCondition: true,
          HasAllergy: true,
          Salutation: "Mr.",
          Height: "178cm",
          Weight: "78kg",
        },
        {
          Code: "PAT1006",
          LastName: "Gagnon",
          FirstName: "Sophie",
          Prov: "QC",
          City: "Quebec City",
          Sex: "F",
          Birthday: new Date(1978, 1, 15),
          HasCondition: true,
          HasAllergy: false,
          Salutation: "Mme",
          Height: "160cm",
          Weight: "60kg",
        },
        {
          Code: "PAT1007",
          LastName: "Miller",
          FirstName: "Robert",
          Prov: "BC",
          City: "Vancouver",
          Sex: "M",
          Birthday: new Date(1965, 10, 30),
          HasCondition: false,
          HasAllergy: false,
          Salutation: "Mr.",
          Height: "182cm",
          Weight: "95kg",
        },
      ];

      const createdPatients = await Promise.all(
        patientsData.map(async (pData, i) => {
          const patient = await db.KrollPatient.create(
            {
              ...pData,
              Address1: "123 Main St",
              Postal: "A1A 1A1",
              Country: "Canada",
              Language: pData.Prov === "QC" ? "F" : "E",
              CreatedOn: new Date(),
              LastChanged: new Date(),
              Active: true,
            },
            { transaction }
          );
          await db.KrollPatientPhone.create(
            {
              PatID: patient.id,
              Description: "Home",
              Phone: `555-010${i}`,
              LongDistance: false,
              Type: 0,
              status: "active",
            },
            { transaction }
          );
          await db.KrollPatientCom.create(
            {
              PatID: patient.id,
              Topic: "General",
              Created: new Date(),
              Changed: new Date(),
              CommentPlainText: "Standard profile.",
              ShowOnRx: false,
            },
            { transaction }
          );
          if (pData.HasCondition) {
            await db.KrollPatientCnd.create(
              {
                PatID: patient.id,
                Code: "R51",
                Comment: "Headache",
                Seq: 1,
                Source: 1,
                DateAdded: new Date(),
              },
              { transaction }
            );
          }
          if (pData.HasAllergy) {
            await db.KrollPatientAlg.create(
              {
                PatID: patient.id,
                Code: "Z88.8",
                Comment: "Other drug allergy",
                Seq: 1,
                Source: 1,
                DateAdded: new Date(),
                CodeType: 1,
              },
              { transaction }
            );
          }
          return patient;
        })
      );
      console.log(`Created ${createdPatients.length} patients.`);

      // --- 2. Create Drugs & Drug Packs (Same as before) ---
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
        },
        {
          BrandName: "Tylenol",
          GenericName: "Acetaminophen",
          DIN: "00559407",
          Schedule: "OTC",
          Form: "Tablet",
          Strength: "500mg",
          Manufacturer: "J&J",
        },
        {
          BrandName: "Lipitor",
          GenericName: "Atorvastatin",
          DIN: "0224 Lipitor",
          Schedule: "Rx",
          Form: "Tablet",
          Strength: "20mg",
          Manufacturer: "Pfizer",
        },
      ];
      const createdDrugs = await Promise.all(
        drugsData.map(async (dData) => {
          const drug = await db.KrollDrug.create(
            {
              ...dData,
              Active: true,
              Created: new Date(),
              Changed: new Date(),
            },
            { transaction }
          );
          const isAcetaminophen = drug.GenericName === "Acetaminophen";
          const isOzempic = drug.BrandName === "Ozempic";
          const packSize = isAcetaminophen
            ? "100.0"
            : isOzempic
            ? "1.0"
            : "90.0";
          const packUnit = isAcetaminophen
            ? "Tablet"
            : isOzempic
            ? "Pen"
            : "Tablet";
          const onHand = isAcetaminophen
            ? "500.0"
            : isOzempic
            ? "10.0"
            : "300.0";
          const acqCost = isAcetaminophen
            ? "5.50"
            : isOzempic
            ? "150.75"
            : "25.50";
          const sellCost = isAcetaminophen
            ? "10.00"
            : isOzempic
            ? "250.00"
            : "45.00";
          await db.KrollDrugPack.create(
            {
              DrgID: drug.id,
              QuickCode: `${dData.DIN.substring(0, 5)}PK`,
              Active: true,
              PackSize: packSize,
              PackUnit: packUnit,
              OnHandQty: onHand,
              AcqCost: acqCost,
              SellingCost: sellCost,
              Created: new Date(),
              Changed: new Date(),
            },
            { transaction }
          );
          return drug;
        })
      );
      console.log(`Created ${createdDrugs.length} drugs with packs.`);

      // --- 3. Create Plans & SubPlans (Add private plans) ---
      console.log("Creating plans and subplans...");
      const plansData = [
        // Provincial
        {
          PlanCode: "OHIP",
          Description: "Ontario Health Insurance Plan",
          Prov: "ON",
          IsProvincialPlan: true,
          BIN: "610502",
        },
        {
          PlanCode: "BCMSP",
          Description: "BC Medical Services Plan",
          Prov: "BC",
          IsProvincialPlan: true,
          BIN: "610402",
        },
        {
          PlanCode: "RAMQ",
          Description: "Régie assurance maladie Québec",
          Prov: "QC",
          IsProvincialPlan: true,
          BIN: "610602",
        },
        {
          PlanCode: "AHCIP",
          Description: "Alberta Health Care Ins Plan",
          Prov: "AB",
          IsProvincialPlan: true,
          BIN: "610001",
        },
        // Private
        {
          PlanCode: "SUNLIFE",
          Description: "Sun Life Financial",
          IsProvincialPlan: false,
          BIN: "610040",
        },
        {
          PlanCode: "MANULIFE",
          Description: "Manulife Financial",
          IsProvincialPlan: false,
          BIN: "610014",
        },
      ];
      const subplanCodes = ["STANDARD", "PREMIUM"];
      const createdPlans = await Promise.all(
        plansData.map(async (pData) => {
          const plan = await db.KrollPlan.create(
            {
              ...pData,
              PharmacyID: `${pData.Prov || "PVT"}PHA001`,
              AlternatePayee: false,
              CheckCoverage: true,
              IsRealTime: true,
            },
            { transaction }
          );
          for (const code of subplanCodes) {
            await db.KrollPlanSub.create(
              {
                PlanID: plan.id,
                SubPlanCode: code,
                Description: `${code} Coverage (${plan.PlanCode})`,
                DefSubPlan: code === "STANDARD",
                CarrierIDRO: false,
                GroupRO: false,
                ClientRO: false,
                CPHARO: false,
                RelRO: false,
                ExpiryRO: false,
                CarrierIDReq: !pData.IsProvincialPlan,
                GroupReq: true,
                ClientReq: true,
                CPHAReq: false,
                RelReq: true,
                ExpiryReq: !pData.IsProvincialPlan,
                DeductReq: false,
                BirthReq: true,
                Active: true,
                AllowManualBilling: true,
              },
              { transaction }
            );
          }
          return plan;
        })
      );
      console.log(`Created ${createdPlans.length} plans with subplans.`);

      // --- 4. Link Patients to Plans (including multiple plans) ---
      console.log("Linking patients to plans...");
      const createdPatientPlansMap = new Map(); // Store plans per patient
      for (let i = 0; i < createdPatients.length; i++) {
        const patient = createdPatients[i];
        const patientPlans = []; // Store plans for *this* patient
        const provPlan = createdPlans.find(
          (p) => p.Prov === patient.Prov && p.IsProvincialPlan
        );
        const privatePlans = createdPlans.filter((p) => !p.IsProvincialPlan);
        let sequence = 0;

        // Add Provincial Plan (if exists for province)
        if (provPlan) {
          sequence++;
          const subplan = await db.KrollPlanSub.findOne({
            where: { PlanID: provPlan.id, SubPlanCode: "STANDARD" },
            transaction,
          });
          if (subplan) {
            const pp = await db.KrollPatientPlan.create(
              {
                PatID: patient.id,
                PlanID: provPlan.id,
                SubPlanID: subplan.id,
                Sequence: sequence,
                Cardholder: `${patient.FirstName} ${patient.LastName}`,
                GroupID: `GRP${provPlan.Prov}${i}`,
                ClientID: `${patient.LastName.toUpperCase()}${i}`,
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
            patientPlans.push(pp); // Add to this patient's list
          }
        }

        // Add a private plan to some patients (e.g., patient 3 and 4)
        if (i === 3 || i === 4) {
          // Jane Smith (ON) and David Jones (AB)
          sequence++;
          const privatePlan = privatePlans[i % privatePlans.length]; // Cycle through private plans
          const subplan = await db.KrollPlanSub.findOne({
            where: { PlanID: privatePlan.id, SubPlanCode: "PREMIUM" },
            transaction,
          });
          if (subplan) {
            const pp = await db.KrollPatientPlan.create(
              {
                PatID: patient.id,
                PlanID: privatePlan.id,
                SubPlanID: subplan.id,
                Sequence: sequence,
                Cardholder: `${patient.FirstName} ${patient.LastName}`,
                CarrierID: `CARR${i}`,
                GroupID: `PVTGRP${i}`,
                ClientID: `${patient.LastName.toUpperCase()}${i}PVT`,
                Rel: "01",
                Expiry: addDays(new Date(), 365),
                Birthday: patient.Birthday,
                PatSex: patient.Sex,
                FirstName: patient.FirstName,
                LastName: patient.LastName,
                AlwaysUseInRx: sequence === 1,
                Deleted: false,
              },
              { transaction }
            );
            patientPlans.push(pp); // Add to this patient's list
          }
        }
        createdPatientPlansMap.set(patient.id, patientPlans); // Store the list for the patient ID
      }
      console.log(`Linked plans for ${createdPatientPlansMap.size} patients.`);

      // --- 5. Create Prescriptions, Adjudication, Invoices, Payments (MODIFIED FOR MULTI-PLAN) ---
      console.log(
        "Creating historical prescriptions chain with multi-plan logic..."
      );
      let baseRxNum = 10000;
      const paymentMethods = ["credit", "debit", "cash"];
      const today = new Date();
      const numberOfMonthsToSeed = 18;

      for (
        let monthOffset = numberOfMonthsToSeed - 1;
        monthOffset >= 0;
        monthOffset--
      ) {
        const currentMonthDate = subMonths(today, monthOffset);
        const monthStart = startOfMonth(currentMonthDate);
        const prescriptionsInMonth = Math.floor(Math.random() * 4) + 1; // 1-4 Rxs per month per patient

        console.log(
          ` seeding for month: ${format(currentMonthDate, "yyyy-MM")}`
        );

        for (const patient of createdPatients) {
          // Get this patient's plans, ordered by sequence (fetch once per patient per month)
          const patientPlanInstances = await db.KrollPatientPlan.findAll({
            where: { PatID: patient.id },
            include: [
              { model: db.KrollPlan, as: "plan" },
              { model: db.KrollPlanSub, as: "subplan" },
            ],
            order: [["Sequence", "ASC"]],
            transaction,
          });

          for (let rxCount = 0; rxCount < prescriptionsInMonth; rxCount++) {
            const drugIndex = Math.floor(Math.random() * createdDrugs.length);
            const drug = createdDrugs[drugIndex];
            const fillDate = addDays(
              monthStart,
              Math.floor(Math.random() * 28)
            ); // Random day within the month

            const drugPack = await db.KrollDrugPack.findOne({
              where: { DrgID: drug.id },
              transaction,
            });
            if (!drugPack) continue;

            const dispQty =
              drug.BrandName === "Ozempic"
                ? 1.0
                : Math.random() > 0.5
                ? 90.0
                : 30.0;
            const daysSupply =
              drug.BrandName === "Ozempic" ? 28 : dispQty === 90.0 ? 90 : 30;

            // --- Pricing ---
            const baseCost = parseFloat(drugPack.AcqCost);
            const packSize = parseFloat(drugPack.PackSize);
            const costPerDispUnit = baseCost / packSize;
            const aac = parseFloat((costPerDispUnit * dispQty).toFixed(2));
            const markup = parseFloat((aac * 0.1).toFixed(2));
            const fee = 12.5;
            const totalCharge = parseFloat((aac + markup + fee).toFixed(2));
            // --- End Pricing ---

            const rxNum = baseRxNum++;

            // Create Prescription (initial state)
            const prescription = await db.KrollRxPrescription.create(
              {
                PatID: patient.id,
                DrgID: drug.id,
                OrigRxNum: rxNum,
                RxNum: rxNum,
                Init: "SYS",
                UserInit: "SEED",
                FillDate: fillDate,
                WrittenDate: subDays(fillDate, 2),
                FirstFillDate: fillDate,
                LastFillDate: fillDate,
                DispQty: dispQty.toString(),
                DaysSupply: daysSupply,
                AuthQty: (dispQty * 3).toString(),
                RemQty: (dispQty * 2).toString(),
                Labels: 1,
                ProductSelection: 1,
                SIG: `Take as directed`,
                DIN: drug.DIN,
                PackSize: drugPack.PackSize,
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

            // --- Sequential Adjudication ---
            let currentRemainingCharge = totalCharge;
            let totalInsurancePaid = 0;
            let overallAdjState = 0; // Default state (no coverage)
            const adjDate = addDays(fillDate, 1); // Simulate adj day after fill

            // Decide which plans to apply
            const planApplicationScenario = Math.random();
            let plansToAttempt = [];
            if (patientPlanInstances.length > 0) {
              if (planApplicationScenario < 0.2) {
                // 20% no plans
                plansToAttempt = [];
              } else if (planApplicationScenario < 0.7) {
                // 50% primary only
                plansToAttempt = [patientPlanInstances[0]];
              } else {
                // 30% all plans sequentially
                plansToAttempt = patientPlanInstances;
              }
            }

            for (const patientPlan of plansToAttempt) {
              if (currentRemainingCharge <= 0) break; // Stop if already fully covered

              const drugInfoForAdj = {
                BrandName: drug.BrandName,
                GenericName: drug.GenericName,
                totalCharge: totalCharge,
              };
              const adjResult = simulateSinglePlanAdjudication(
                patientPlan,
                currentRemainingCharge,
                drugInfoForAdj
              );

              // Create RxPlan & RxPlanAdj for THIS plan attempt
              const rxPlan = await db.KrollRxPrescriptionPlan.create(
                {
                  RxNum: rxNum,
                  PatPlnID: patientPlan.id,
                  Seq: patientPlan.Sequence,
                  Pays: adjResult.insurancePays.toFixed(2),
                  TranType: 1,
                  AdjState: adjResult.adjState,
                  SubPlanCode: patientPlan.subplan.SubPlanCode,
                  IsRT: true,
                  AdjDate: adjDate,
                },
                { transaction }
              );
              await db.KrollRxPrescriptionPlanAdj.create(
                {
                  RxPlnID: rxPlan.id,
                  TS: adjDate,
                  ResultCode: adjResult.resultCode,
                  AdjDate: adjDate,
                  Cost: aac.toFixed(2),
                  Markup: markup.toFixed(2),
                  Fee: fee.toFixed(2),
                  MixFee: "0.00",
                  SSCFee: "0.00",
                  PlanPays: adjResult.insurancePays.toFixed(2),
                  SubCost: aac.toFixed(2),
                  SubMarkup: markup.toFixed(2),
                  SubFee: fee.toFixed(2),
                  SubMixFee: "0.00",
                  SubSSCFee: "0.00",
                  PrevPaid: "0.00",
                  AdjudicationLevel: patientPlan.Sequence,
                  RxNum: rxNum,
                  Copay: Math.max(
                    0,
                    currentRemainingCharge - adjResult.insurancePays
                  ).toFixed(2),
                  Deductible: "0.00",
                  CoInsurance: "0.00",
                },
                { transaction }
              );

              currentRemainingCharge -= adjResult.insurancePays;
              totalInsurancePaid += adjResult.insurancePays;

              if (adjResult.adjState === 1) {
                overallAdjState = 1; // Mark as paid if any plan pays
              } else if (overallAdjState !== 1) {
                overallAdjState = adjResult.adjState; // Keep last non-paid state if nothing paid yet
              }
            }

            const finalPatientPortion = Math.max(
              0,
              parseFloat(currentRemainingCharge.toFixed(2))
            );
            // Update prescription overall adj state
            prescription.AdjState = overallAdjState;
            await prescription.save({ transaction });
            // --- End Adjudication ---

            // Create Invoice (with final patient portion)
            const invoice = await db.Invoice.create(
              {
                PatientId: patient.id,
                RxId: prescription.id,
                InvoiceDate: fillDate,
                DueDate: addDays(fillDate, 30),
                Description: `Rx #${rxNum} ${drug.BrandName}`,
                Amount: totalCharge.toFixed(2),
                AmountPaid: "0.00",
                InsuranceCoveredAmount: totalInsurancePaid.toFixed(2),
                PatientPortion: finalPatientPortion.toFixed(2),
                Status: finalPatientPortion <= 0 ? "paid" : "pending",
              },
              { transaction }
            );

            // Create Patient Payment (if needed, based on final patient portion)
            if (finalPatientPortion > 0) {
              let paymentAmount = 0.0;
              const paymentScenario = Math.random();
              if (paymentScenario < 0.7) {
                // 70% chance of full payment
                paymentAmount = finalPatientPortion;
              } else if (paymentScenario < 0.85) {
                // 15% chance of partial payment
                paymentAmount = parseFloat(
                  (finalPatientPortion * (Math.random() * 0.5 + 0.2)).toFixed(2)
                );
              }

              if (paymentAmount > 0) {
                const paymentDate = addDays(
                  fillDate,
                  Math.floor(Math.random() * 14) + 3
                );
                await db.Payment.create(
                  {
                    PatientId: patient.id,
                    InvoiceId: invoice.id,
                    Amount: paymentAmount.toFixed(2),
                    PaymentDate: paymentDate,
                    PaymentMethod:
                      paymentMethods[rxNum % paymentMethods.length],
                    TransactionStatus: "completed",
                    isRefund: false,
                  },
                  { transaction }
                );

                // Update invoice amount paid and status
                const currentAmountPaid =
                  parseFloat(invoice.AmountPaid) + paymentAmount;
                invoice.AmountPaid = currentAmountPaid.toFixed(2);
                invoice.Status =
                  currentAmountPaid >= finalPatientPortion
                    ? "paid"
                    : "partially_paid";
                await invoice.save({ transaction });

                // Add a refund sometimes (5% chance if paid fully by patient)
                if (invoice.Status === "paid" && Math.random() < 0.05) {
                  const refundAmount = parseFloat(
                    (paymentAmount * (Math.random() * 0.3 + 0.1)).toFixed(2)
                  );
                  const refundDate = addDays(
                    paymentDate,
                    Math.floor(Math.random() * 7) + 1
                  );
                  await db.Payment.create(
                    {
                      PatientId: patient.id,
                      InvoiceId: invoice.id,
                      Amount: refundAmount.toFixed(2),
                      PaymentDate: refundDate,
                      PaymentMethod: "refund",
                      TransactionStatus: "completed",
                      isRefund: true,
                      Notes: "Seed refund",
                    },
                    { transaction }
                  );

                  // Recalculate AmountPaid and Status after refund
                  const finalAmountPaidAfterRefund =
                    currentAmountPaid - refundAmount;
                  invoice.AmountPaid = finalAmountPaidAfterRefund.toFixed(2);
                  invoice.Status =
                    finalAmountPaidAfterRefund >= finalPatientPortion
                      ? "paid"
                      : "partially_paid";
                  await invoice.save({ transaction });
                }
              }
            } else {
              // If patient portion was 0, ensure invoice status reflects it
              if (invoice.Status !== "paid") {
                invoice.Status = "paid";
                await invoice.save({ transaction });
              }
            }
          } // End loop through Rxs for patient
        } // End loop through patients
      } // End loop through months
      console.log(
        "Finished creating historical prescriptions chain with multi-plan logic."
      );

      // --- 6. Generate Historical Monthly Statements ---
      console.log("Generating historical monthly statements...");
      for (
        let monthOffset = numberOfMonthsToSeed - 1;
        monthOffset >= 0;
        monthOffset--
      ) {
        const currentMonthDate = subMonths(today, monthOffset);
        const year = currentMonthDate.getFullYear();
        const month = currentMonthDate.getMonth() + 1;
        const startDate = startOfMonth(currentMonthDate);
        const endDate = endOfMonth(currentMonthDate);

        for (const patient of createdPatients) {
          // Calculate Opening Balance: Sum of (PatientPortion - AmountPaid) for all invoices *before* this month's start date
          const priorInvoices = await db.Invoice.findAll({
            attributes: ["PatientPortion", "AmountPaid"],
            where: {
              PatientId: patient.id,
              InvoiceDate: { [Op.lt]: startDate }, // Invoices before this month started
            },
            transaction,
            raw: true,
          });
          const openingBalance = priorInvoices.reduce((sum, inv) => {
            const patientPortion = parseFloat(inv.PatientPortion || 0);
            const amountPaid = parseFloat(inv.AmountPaid || 0);
            return sum + (patientPortion - amountPaid);
          }, 0.0);

          // Get charges and payments *within* the current month
          const chargesResult = await db.Invoice.findOne({
            attributes: [
              [
                db.sequelize.fn("SUM", db.sequelize.col("PatientPortion")),
                "totalCharges",
              ],
            ],
            where: {
              PatientId: patient.id,
              InvoiceDate: { [Op.between]: [startDate, endDate] },
            },
            transaction,
            raw: true,
          });
          const paymentSumResult = await db.Payment.findAll({
            attributes: ["Amount", "isRefund"],
            where: {
              PatientId: patient.id,
              PaymentDate: { [Op.between]: [startDate, endDate] },
              TransactionStatus: "completed",
            },
            raw: true,
            transaction,
          });

          const totalCharges = parseFloat(chargesResult?.totalCharges || 0);
          const totalPayments = paymentSumResult.reduce((sum, p) => {
            const paymentAmount = parseFloat(p.Amount || 0);
            return sum + (p.isRefund ? -paymentAmount : paymentAmount);
          }, 0);

          const closingBalance = openingBalance + totalCharges - totalPayments;

          await db.MonthlyStatement.create(
            {
              PatientId: patient.id,
              StatementDate: endDate,
              StartDate: startDate,
              EndDate: endDate,
              OpeningBalance: Math.max(0, openingBalance).toFixed(2), // Prevent negative opening balance display typically
              TotalCharges: totalCharges.toFixed(2),
              TotalPayments: totalPayments.toFixed(2),
              ClosingBalance: closingBalance.toFixed(2),
            },
            { transaction }
          );
        }
        console.log(
          ` Generated monthly statements for ${format(
            currentMonthDate,
            "yyyy-MM"
          )}`
        );
      }
      console.log("Finished generating monthly statements.");

      // --- 7. Generate Historical Financial Statements ---
      console.log("Generating historical financial statements...");
      for (
        let monthOffset = numberOfMonthsToSeed - 1;
        monthOffset >= 0;
        monthOffset--
      ) {
        const currentMonthDate = subMonths(today, monthOffset);
        const year = currentMonthDate.getFullYear();
        const month = currentMonthDate.getMonth() + 1;

        // Calculate data for this specific month
        const statementData = await calculateFinancialStatementForMonth(
          year,
          month,
          transaction
        );

        // Upsert the record for the month
        await db.FinancialStatement.upsert(statementData, { transaction });
        console.log(
          ` Generated financial statement for ${format(
            currentMonthDate,
            "yyyy-MM"
          )}`
        );
      }
      console.log("Finished generating financial statements.");

      await transaction.commit();
      console.log(
        "Database seeding completed successfully! (Enhanced V2 - Multi-Plan)"
      );
    } catch (error) {
      await transaction.rollback();
      console.error(
        "Error seeding database (Enhanced V2 - Multi-Plan):",
        error
      );
      if (error.original) {
        console.error("Original Error:", error.original);
      }
    }
  },

  async down(queryInterface, Sequelize) {
    // Keep the down function simple: just clear all tables in reverse order
    console.log("Reverting seed data (Enhanced V2 - Multi-Plan)...");
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Same clearing logic as in the up method's beginning
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
