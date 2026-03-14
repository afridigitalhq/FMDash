#!/bin/bash
RENDER_WS="wss://afridigital-fmdash.onrender.com/ws"
TARGETS_FILE="$HOME/FMDash/targets.txt"
if [ ! -f "$TARGETS_FILE" ]; then echo "[ERROR] Targets file missing"; exit 1; fi
node -e "
const WebSocket=require('ws');const fs=require('fs');const {exec}=require('child_process');
const ws=new WebSocket('$RENDER_WS');const nodeID='Termux_'+Math.floor(Math.random()*1000);
ws.on('open',()=>{
  console.log('[WS] Connected as',nodeID);
  const targets=fs.readFileSync('$TARGETS_FILE','utf-8').split('\\n').filter(Boolean);
  targets.forEach(target=>{
    exec(\`nuclei -u \${target} -json\`,(err,stdout,stderr)=>{
      if(err){console.error(err);return;}
      stdout.split('\\n').filter(Boolean).forEach(line=>{
        try{
          const scanObj=JSON.parse(line);
          const scanResult={target:scanObj.host||target,vulnerability:scanObj.info.name||'Unknown',severity:scanObj.info.severity||'Medium',nodeID};
          if(ws.readyState===WebSocket.OPEN) ws.send(JSON.stringify({action:'pushScan',scan:scanResult,nodeID}));
        }catch(e){console.error('[PARSE ERROR]',e);}
      });
    });
  });
});
ws.on('close',()=>console.warn('[WS] Disconnected'));
ws.on('error',err=>console.error('[WS] Error:',err));
"
