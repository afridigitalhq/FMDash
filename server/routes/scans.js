const express = require("express");
const router = express.Router();

const {
  createScan,
  getScans
} = require("../controllers/scanController");

router.post("/",createScan);
router.get("/",getScans);

module.exports = router;
