const express = require("express");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const http = require("http");
const WebSocket = require("ws");

app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../client/release")));

// Routes
app.get("/", (req, res) => {
  const adminCookie = req.cookies?.FMDASH_ADMIN;
  if(adminCookie === "true"){
    res.redirect("/admin");
  } else {
    res.sendFile(path.join(__dirname,"../client/release/guest.html"));
  }
});

app.get("/admin", (req,res) => {
  res.sendFile(path.join(__dirname,"../client/release/admin.html"));
});

// HTTP & WebSocket server
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let clients = [];
let whitelist = {};  // Fill in as needed
let blockedIPs = new Set();

function blockNode(ws, reason){
  console.log(`[BLOCKED] ${ws.nodeId||'UNKNOWN'}: ${reason}`);
  ws.close();
}

function broadcast(data){
  clients.forEach(c => {
    if(c.readyState === WebSocket.OPEN) c.send(JSON.stringify(data));
  });
}

// WebSocket connection handling
wss.on('connection', ws => {
  ws.isAuthorized = false;

  ws.on('message', msg => {
    try {
      const data = JSON.parse(msg);

      if(data.action === 'register'){
        const entry = whitelist[data.nodeId];
        if(entry && data.token === entry.token){
          ws.nodeId = data.nodeId;
          ws.capabilities = entry.capabilities;
          ws.isAuthorized = true;
          clients.push(ws);
          ws.send(JSON.stringify({message:'Node registered successfully'}));
          console.log(`[INFO] Node ${ws.nodeId} registered`);
        } else {
          blockNode(ws, 'Invalid registration');
        }
        return;
      }

      if(!ws.isAuthorized){
        blockNode(ws,'Unauthorized');
        return;
      }

      switch(data.action){
        case 'scan':
          if(ws.capabilities?.scan){
            broadcast({scan:{target:data.target||'example.com',vulnerability:'SQL Injection',severity:'High',timestamp:Date.now()}});
          } else blockNode(ws,'Unauthorized scan attempt');
          break;
        case 'logs':
          if(ws.capabilities?.logs){
            console.log(`[LOG] Node ${ws.nodeId}: ${JSON.stringify(data.content)}`);
          } else blockNode(ws,'Unauthorized logs attempt');
          break;
        case 'manual-stop':
          if(ws.capabilities?.manualStop){
            broadcast({log:`Manual Stop executed by ${ws.nodeId}`});
          } else blockNode(ws,'Unauthorized manual stop attempt');
          break;
        case 'auto-stop':
          if(ws.capabilities?.autoStop){
            broadcast({log:`Auto Stop executed by ${ws.nodeId}`});
          } else blockNode(ws,'Unauthorized auto stop attempt');
          break;
        case 'heartbeat':
          ws.send(JSON.stringify({message:'alive'}));
          break;
        default:
          blockNode(ws,'Unknown action');
      }

    } catch(e){
      console.log(e);
      blockNode(ws,'Malformed message');
    }
  });

  ws.on('close', () => { clients = clients.filter(c => c !== ws); });
  ws.send(JSON.stringify({client:{coins:150,tier:'Basic'}}));
});

server.listen(5000, ()=>console.log('FMDash server running on port 5000'));
