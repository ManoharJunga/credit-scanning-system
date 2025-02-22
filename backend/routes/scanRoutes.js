const express = require("express");
const router = express.Router();
const scanController = require("../controllers/scanController");

router.post("/add", scanController.addScan);
router.get("/", scanController.getScans);

module.exports = router;
