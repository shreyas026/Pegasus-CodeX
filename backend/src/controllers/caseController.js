const Case = require("../models/Case");
const { analyzeCaseData } = require("../services/analysisService");

const createCase = async (req, res, next) => {
  try {
    const {
      victimName,
      age,
      abuseType,
      incidentDescription,
      frequency,
      threatLevel,
      statement
    } = req.body;

    const createdCase = await Case.create({
      victimName,
      age,
      abuseType,
      incidentDescription,
      frequency,
      threatLevel,
      statement: statement || ""
    });

    res.status(201).json({
      message: "Case created successfully",
      caseId: createdCase._id,
      data: createdCase
    });
  } catch (error) {
    next(error);
  }
};

const analyzeCase = async (req, res, next) => {
  try {
    const { caseId, statement } = req.body;

    if (!caseId) {
      return res.status(400).json({ message: "caseId is required" });
    }

    const caseDoc = await Case.findById(caseId);
    if (!caseDoc) {
      return res.status(404).json({ message: "Case not found" });
    }

    if (typeof statement === "string") {
      caseDoc.statement = statement;
    }

    const result = analyzeCaseData(caseDoc);

    caseDoc.analysis = result;
    await caseDoc.save();

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getCaseById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const caseDoc = await Case.findById(id);

    if (!caseDoc) {
      return res.status(404).json({ message: "Case not found" });
    }

    return res.status(200).json(caseDoc);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCase,
  analyzeCase,
  getCaseById
};