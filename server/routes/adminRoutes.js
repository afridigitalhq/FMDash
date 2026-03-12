// PATCH v5: /admin/add-scan route
const express = require("express");
const router = express.Router();
const verifyApiKey = require("../middlewares/verifyApiKey");
const scans = [];
router.post("/add-scan", verifyApiKey, (req,res)=>{
  const { target,vulnerability,severity,timestamp } = req.body;
  if(!target||!vulnerability||!severity||!timestamp)
    return res.status(400).json({ message:"Missing scan data" });
  scans.push({ target,vulnerability,severity,timestamp });
  if(req.app.get("io")) req.app.get("io").emit("new-scan",{ target,vulnerability,severity,timestamp });
  res.json({ message:"Scan added", scan:{ target,vulnerability,severity,timestamp } });
});
router.get("/test", verifyApiKey, (req,res)=>res.json({ message:"Admin route accessed successfully" }));
module.exports = router;
