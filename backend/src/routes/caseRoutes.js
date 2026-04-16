const express = require("express");
const {
  createCase,
  analyzeCase,
  getCaseById
} = require("../controllers/caseController");

const router = express.Router();

router.post("/create", createCase);
router.post("/analyze", analyzeCase);
router.get("/:id", getCaseById);

module.exports = router;