const express=require('express'); const http=require('http'); const WebSocket=require('ws'); const app=express(); const server=http.createServer(app);
app.use(express.json());
const PORT=process.env.PORT||5000;
let clients={},scans=[],nodes={},admins={master:{username:'master',password:'master123',role:'master',unlimited:true}};

// Admin endpoints (master only)
app.post('/api/add-admin',(req,res)=>{const { masterKey, username,password,role='aux' }=req.body;if(masterKey!=='MASTER_SECRET_KEY')return res.status(403).json({error:'Unauthorized'});if(admins[username])return res.status(400).json({error:'Username exists'});admins[username]={username,password,role,unlimited:false};res.json({message:`Aux admin ${username} added.`});});
app.get('/api/list-admins',(req,res)=>{const key=req.query.masterKey;if(key!=='MASTER_SECRET_KEY')return res.status(403).json({error:'Unauthorized'});res.json(admins);});
app.post('/api/remove-admin',(req,res)=>{const { masterKey, username }=req.body;if(masterKey!=='MASTER_SECRET_KEY')return res.status(403).json({error:'Unauthorized'});if(admins[username] && admins[username].role==='aux'){ delete admins[username]; res.json({message:`Aux admin ${username} removed.`});} else res.status(400).json({error:'Invalid username or cannot remove master'});});

// Scan endpoints
app.get('/api/scan-results',(req,res)=>{res.json(scans);});
app.post('/api/scan-results',(req,res)=>{
  const scan={...req.body,timestamp:new Date()};
  if(scan.target && scan.vulnerability){
    scans.push(scan);
    wss.clients.forEach(c=>{if(c.readyState===WebSocket.OPEN)c.send(JSON.stringify({scan}));});
    res.status(200).json({message:'Scan broadcasted.'});
  }else res.status(200).json({message:'Scan queued.'});
});

// WebSocket
const wss=new WebSocket.Server({server,path:'/ws'});
wss.on('connection',ws=>{
  ws.send(JSON.stringify({scans,client:clients['default']||{}}));
  ws.on('message',m=>{
    try{const data=JSON.parse(m);switch(data.action){
      case'heartbeat': if(data.nodeID){nodes[data.nodeID]={lastPing:new Date(),online:true};} break;
      case'pushScan': const scan={...data.scan,timestamp:new Date()}; scans.push(scan); wss.clients.forEach(c=>{if(c.readyState===WebSocket.OPEN)c.send(JSON.stringify({scan}));}); break;
      case'scanTarget': if(clients['default']&&clients['default'].coins>=data.cost){clients['default'].coins-=data.cost; wss.clients.forEach(c=>{if(c.readyState===WebSocket.OPEN)c.send(JSON.stringify({client:clients['default']}));}); console.log('Scan sent to nodes');} break;
      case'manualOverride': if(clients['default']&&clients['default'].coins>=data.cost){clients['default'].coins-=data.cost; ws.send(JSON.stringify({client:clients['default'],override:'manualStopAttack'}));} break;
      case'autoOverride': if(clients['default']&&clients['default'].coins>=data.cost){clients['default'].coins-=data.cost; ws.send(JSON.stringify({client:clients['default'],override:'autoStopAttack'}));} break;
      case'paystack': ws.send(JSON.stringify({payment:'paystack',tier:data.tier})); break;
      case'crypto': ws.send(JSON.stringify({payment:'crypto',tier:data.tier})); break;
      default: console.log('Unknown WS action:',data.action);
    }}catch(e){console.error(e);}
  });
  ws.on('close',()=>console.log('Client disconnected'));
});

// Simulated scan push every 10s
const targets=['https://juice-shop.herokuapp.com','https://example.com'];
setInterval(()=>{targets.forEach(t=>{const scan={target:t,vulnerability:['XSS','SQL Injection','Open Port'][Math.floor(Math.random()*3)],severity:['High','Medium','Low'][Math.floor(Math.random()*3)],nodeID:'ServerNode',timestamp:new Date()}; scans.push(scan); wss.clients.forEach(c=>{if(c.readyState===WebSocket.OPEN)c.send(JSON.stringify({scan}));});});},10000);

server.listen(PORT,()=>console.log(`Server running on port ${PORT}`));
