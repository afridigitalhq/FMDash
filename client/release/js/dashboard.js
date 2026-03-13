const ws=new WebSocket('https://afridigital-fmdash.onrender.com/ws'); ws.isMaster=true;
ws.addEventListener('open',()=>console.log('Connected via WS'));
ws.addEventListener('message',(event)=>{
  const data=JSON.parse(event.data);
  if(data.client) handleClient(data.client);
  if(data.scan){
    const table=document.getElementById('scan-results');
    const row=document.createElement('tr');
    row.innerHTML=`<td>${data.scan.target}</td><td>${data.scan.vulnerability}</td><td style="color:${data.scan.severity==='High'?'red':data.scan.severity==='Medium'?'orange':'green'}">${data.scan.severity}</td><td>${ws.isMaster?data.scan.nodeID:''}</td><td>${new Date(data.scan.timestamp).toLocaleString()}</td>`;
    table.appendChild(row);
  }
});

setInterval(()=>{if(ws.readyState===WebSocket.OPEN) ws.send(JSON.stringify({action:'heartbeat',nodeID:'MasterNode'}));},30000);
ws.addEventListener('close',()=>{console.warn('WS closed. Reload in 5s'); setTimeout(()=>{location.reload();},5000);});

function handleClient(client){
  document.getElementById('wallet').textContent=client.wallet||0;
  document.getElementById('coins').textContent=client.coins||0;
  updateOverrides(client);
}

function updateOverrides(client){
  const m=document.getElementById('manual-override'),a=document.getElementById('auto-override');
  const premium=client.premiumTier||false;
  m.disabled=!(premium||client.coins>=20);
  a.disabled=!(premium||client.coins>=50);
}

document.getElementById('manual-override').addEventListener('click',()=>{ ws.send(JSON.stringify({action:'manualOverride',cost:20})); });
document.getElementById('auto-override').addEventListener('click',()=>{ ws.send(JSON.stringify({action:'autoOverride',cost:50})); });

// Scan button with coin check
function startScan(type,cost){
  ws.send(JSON.stringify({action:'scanTarget',scanType:type,cost}));
}

// Payment
function payWithPaystack(tier){ ws.send(JSON.stringify({action:'paystack',tier})); }
function payWithCrypto(tier){ ws.send(JSON.stringify({action:'crypto',tier})); }

function logout(){ alert('Sign out clicked'); }
