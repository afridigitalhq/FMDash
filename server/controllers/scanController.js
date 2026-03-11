const Scan = require("../models/Scan");

// Create scan record
exports.createScan = async (req,res)=>{
  try{
    const scan = await Scan.create(req.body);
    res.json({status:"saved",data:scan});
  }catch(err){
    res.status(500).json({error:err.message});
  }
};

// Get all scans
exports.getScans = async (req,res)=>{
  try{
    const scans = await Scan.find().sort({timestamp:-1});
    res.json(scans);
  }catch(err){
    res.status(500).json({error:err.message});
  }
};
