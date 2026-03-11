const express = require('express');
const router = express.Router();
const apiKeyMiddleware = require('../middleware/apiKeyMiddleware');
let scans = [];
router.get('/test', apiKeyMiddleware, (req,res)=>res.json({message:'Admin route accessed successfully'}));
router.post('/login', (req,res)=>{
  const {username,password}=req.body;
  if(username===process.env.ADMIN_USERNAME && password===process.env.ADMIN_PASSWORD)
    return res.json({message:'Login successful'});
  return res.status(401).json({message:'Unauthorized: Invalid credentials'});
});
function addScanHandler(req,res,next,emitCallback){
  const {target,vulnerability,severity,timestamp}=req.body;
  const scan={target,vulnerability,severity,timestamp};
  scans.push(scan);
  if(emitCallback) emitCallback(scan);
  res.json({message:'Scan added',scan});
}
router.post('/add-scan', apiKeyMiddleware, (req,res,next)=>addScanHandler(req,res,next));
router.get('/scans', apiKeyMiddleware, (req,res)=>res.json(scans));
module.exports = router;
module.exports.addScanHandler = addScanHandler;
