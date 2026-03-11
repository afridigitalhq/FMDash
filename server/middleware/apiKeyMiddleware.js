require('dotenv').config();
module.exports=(req,res,next)=>{
  const key=req.headers['x-api-key'];
  if(key && key===process.env.API_KEY) next();
  else res.status(401).json({message:'Unauthorized: Invalid API key'});
};
