function showPanel(p){['dashboard','nodes','premium','logs'].forEach(x=>document.getElementById(x+'-panel').style.display='none');document.getElementById(p+'-panel').style.display='block');}
let coins=150,tier='Basic'; document.getElementById('coin-balance').innerText=coins; document.getElementById('tier').innerText=tier;
function updateButtons(){ document.getElementById('scan-btn').classList.remove('disabled'); document.getElementById('manual-stop-btn').classList.toggle('disabled',coins<20); document.getElementById('auto-stop-btn').classList.toggle('disabled',tier==='Basic'); }
updateButtons();
function addNotification(m){const n=document.createElement('div');n.innerText=m;document.getElementById('notifications').appendChild(n);setTimeout(()=>n.remove(),5000);}
function buyCoins(a){coins+=a; document.getElementById('coin-balance').innerText=coins; updateButtons(); addNotification(`Bought ${a} coins.`);}
const ws=new WebSocket("wss://afridigital-fmdash.onrender.com");
ws.addEventListener('open',()=>{console.log('Connected to FMDash WebSocket');ws.send(JSON.stringify({action:'register',nodeId:'NODE_001',token:'abc123'}));});
ws.addEventListener('message',e=>{const d=JSON.parse(e.data); if(d.client){coins=d.client.coins;tier=d.client.tier;document.getElementById('coin-balance').innerText=coins;document.getElementById('tier').innerText=tier;updateButtons();} if(d.scan){const t=document.getElementById('scan-results').querySelector('tbody');const r=document.createElement('tr');r.innerHTML=`<td>${d.scan.target}</td><td>${d.scan.vulnerability}</td><td style="color:${d.scan.severity==='High'?'red':d.scan.severity==='Medium'?'orange':'green'}">${d.scan.severity}</td><td>${new Date(d.scan.timestamp).toLocaleString()}</td>`;t.appendChild(r);} if(d.log){const c=document.getElementById('logs-container');const x=document.createElement('div');x.innerText=d.log;c.appendChild(x);}});
setInterval(()=>{if(ws.readyState===1) ws.send(JSON.stringify({action:'heartbeat'}));},30000);
document.getElementById('scan-btn').addEventListener('click',()=>{if(coins>=10){ws.send(JSON.stringify({action:'scan',target:'example.com'}));coins-=10;updateButtons();addNotification('Scan started - 10 coins deducted');}else addNotification('Not enough coins');});
document.getElementById('manual-stop-btn').addEventListener('click',()=>{if(coins>=20){ws.send(JSON.stringify({action:'manual-stop'}));coins-=20;updateButtons();addNotification('Manual Stop executed - 20 coins deducted');}else addNotification('Not enough coins');});
document.getElementById('auto-stop-btn').addEventListener('click',()=>{if(tier!=='Basic'&&coins>=50){ws.send(JSON.stringify({action:'auto-stop'}));coins-=50;updateButtons();addNotification('Auto Stop executed - 50 coins deducted');}else addNotification('Not enough coins or tier too low');});
function _2showNodesMgmt(){document.getElementById('nodes-panel').style.display='none';document.getElementById('nodes-management-panel').style.display='block';}
function refreshNodesTable(nodes){
  const tbody=document.getElementById('nodes-mgmt-table').querySelector('tbody'); tbody.innerHTML='';
  nodes.forEach(n=>{
    const tr=document.createElement('tr');
    tr.innerHTML=\`<td>\${n.nodeId}</td><td>\${n.token}</td><td>\${n.capabilities.scan}</td><td>\${n.capabilities.logs}</td><td>\${n.capabilities.manualStop}</td><td>\${n.capabilities.autoStop}</td>
    <td><button onclick="removeNode('\${n.nodeId}')">Remove</button></td>\`;
    tbody.appendChild(tr);
  });
}
function addNode(){
  const nodeId=document.getElementById('new-node-id').value.trim();
  const token=document.getElementById('new-node-token').value.trim();
  const capabilities={
    scan:document.getElementById('cap-scan').checked,
    logs:document.getElementById('cap-logs').checked,
    manualStop:document.getElementById('cap-manual').checked,
    autoStop:document.getElementById('cap-auto').checked
  };
  if(nodeId && token){
    ws.send(JSON.stringify({action:'add-node',nodeId,token,capabilities}));
  } else alert('Node ID and Token required');
}
function removeNode(nodeId){ ws.send(JSON.stringify({action:'remove-node',nodeId})); }

document.getElementById('add-node-btn').addEventListener('click',addNode);

// Listen for server updates about nodes
ws.addEventListener('message',e=>{
  const d=JSON.parse(e.data);
  if(d.nodes){ refreshNodesTable(d.nodes); }
});
// --- Adjust Scan Cost to 5 Coins ---
document.getElementById('scan-btn').addEventListener('click',()=>{
  if(coins>=5){
    ws.send(JSON.stringify({action:'scan',target:'example.com'}));
    coins-=5;
    updateButtons();
    addNotification('Scan started - 5 coins deducted');
  } else addNotification('Not enough coins');
});
// --- Update Scan Cost to 5 Coins ---
const SCAN_COST = 5;
document.getElementById('scan-btn').addEventListener('click',()=>{
  if(coins >= SCAN_COST){
    ws.send(JSON.stringify({action:'scan', target:'example.com'}));
    coins -= SCAN_COST;
    updateButtons();
    addNotification(`Scan started - ${SCAN_COST} coins deducted`);
  } else addNotification('Not enough coins');
});
// --- Manual & Auto Stop Costs ---
const MANUAL_STOP_COST = 20;
const AUTO_STOP_COST = 50;

document.getElementById('manual-stop-btn').addEventListener('click',()=>{
  if(coins >= MANUAL_STOP_COST && tier!=='Basic'){
    ws.send(JSON.stringify({action:'manual-stop'}));
    coins -= MANUAL_STOP_COST;
    updateButtons();
    addNotification(`Manual Stop executed - ${MANUAL_STOP_COST} coins deducted`);
  } else addNotification('Not enough coins or tier too low');
});

document.getElementById('auto-stop-btn').addEventListener('click',()=>{
  if(coins >= AUTO_STOP_COST && tier!=='Basic'){
    ws.send(JSON.stringify({action:'auto-stop'}));
    coins -= AUTO_STOP_COST;
    updateButtons();
    addNotification(`Auto Stop executed - ${AUTO_STOP_COST} coins deducted`);
  } else addNotification('Not enough coins or tier too low');
});
// --- Live Premium Tier & Coin Panel ---
function updatePremiumPanel(){
  const panel = document.getElementById('premium-panel');
  panel.innerHTML = `
    <h2>Upgrade / Buy Coins</h2>
    <p>Current Coins: ${coins} | Tier: ${tier}</p>
    <button onclick="buyCoins(100)">Buy 100 Coins</button>
    <button onclick="buyCoins(300)">Buy 300 Coins</button>
    <button onclick="buyCoins(500)">Buy 500 Coins</button>
    <p>Action Costs: Scan = 5, Manual Stop = 20, Auto Stop = 50</p>
    <p>Tier Limits: Basic = Scan only, Pro = Scan + Manual/Auto Stop, Elite = All actions</p>
  `;
}
function buyCoin_2s(amount){ coins += amount; updateButtons(); updatePremiumPanel(); addNotification(`Bought ${amount} coins.`); }
setInterval(updatePremiumPanel, 5000); // refresh panel every 5s to reflect live changes
updatePremiumPanel();
// --- Live Premium Tier & Coin Panel ---
function updatePremiumPanel_2(){
  const panel _2= document.getElementById('premium-panel');
  panel.innerHTML = `
    <h2>Upgrade / Buy Coins</h2>
    <p>Current Coins: ${coins} | Tier: ${tier}</p>
    <button onclick="buyCoins(100)">Buy 100 Coins</button>
    <button onclick="buyCoins(300)">Buy 300 Coins</button>
    <button onclick="buyCoins(500)">Buy 500 Coins</button>
    <p>Action Costs: Scan = 5, Manual Stop = 20, Auto Stop = 50</p>
    <p>Tier Limits: Basic = Scan only, Pro = Scan + Manual/Auto Stop, Elite = All actions</p>
  `;
}
function buyCoin_3s(amount){ coins += amount; updateButtons(); updatePremiumPanel(); addNotification(`Bought ${amount} coins.`); }
setInterval(updatePremiumPanel, 5000); // refresh panel every 5s to reflect live changes
updatePremiumPanel();
// === Master Admin Panel ===
function _3showAdminPanel(){
  const main = document.getElementById('main');
  main.innerHTML = `
    <h2>Master Admin: Node & Client Management</h2>
    <div id="admin-notifications"></div>
    <h3>Connected Nodes</h3>
    <table id="admin-nodes-table"><thead><tr><th>Node ID</th><th>Status</th><th>Capabilities</th><th>Actions</th></tr></thead><tbody></tbody></table>
    <h3>Client Overrides</h3>
    <table id="admin-clients-table"><thead><tr><th>Client</th><th>Coins</th><th>Tier</th><th>Actions</th></tr></thead><tbody></tbody></table>
  `;

  // --- Populate nodes ---
  function refre_2shNodes(nodes){
    const tbody = document.querySelector('#admin-nodes-table tbody');
    tbody.innerHTML='';
    nodes.forEach(n=>{
      const row = document.createElement('tr');
      row.innerHTML=`<td>${n.nodeId}</td>
                     <td class="${n.online?'status-online':'status-offline'}">${n.online?'Online':'Offline'}</td>
                     <td>${JSON.stringify(n.capabilities)}</td>
                     <td>
                       <button onclick="removeNode('${n.nodeId}')">Remove</button>
                     </td>`;
      tbody.appendChild(row);
    });
  }

  // --- Populate clients ---
  function refre_3shClients(clients){
    const tbody _2= document.querySelector('#admin-clients-table tbody');
    tbody.innerHTML='';
    clients.forEach(c=>{
      const row _2= document.createElement('tr');
      row.innerHTML=`<td>${c.username}</td>
                     <td>${c.coins}</td>
                     <td>${c.tier}</td>
                     <td>
                       <button onclick="overrideCoins('${c.username}',50)">+50 Coins</button>
                       <button onclick="setTier('${c.username}','Elite')">Set Elite</button>
                     </td>`;
      tbody.appendChild(row);
    });
  }

  // --- Example functions ---
  window.removeNode = nodeId=>{ ws.send(JSON.stringify({action:'remove-node', nodeId})); addAdminNotification(`Requested removal of ${nodeId}`)); };
  window.overrideCoins = (user,amount)=>{ ws.send(JSON.stringify({action:'override-coins', username:user, coins:amount})); addAdminNotification(`Override ${amount} coins for ${user}`); };
  window.setTier = (user,tier)=>{ ws.send(JSON.stringify({action:'set-tier', username:user, tier:tier})); addAdminNotification(`Set tier ${tier} for ${user}`); };

  function addAdminNotification(msg){ const n=document.createElement('div'); n.innerText=msg; document.getElementById('admin-notifications').appendChild(n); setTimeout(()=>n.remove(),5000); }

  // --- Refresh live every 5s ---
  setInterval(()=>{
    ws.send(JSON.stringify({action:'request-nodes'}));
    ws.send(JSON.stringify({action:'request-clients'}));
  },5000);

  ws.addEventListener('message', e=>{
    const d = JSON.parse(e.data);
    if(d.nodes) refreshNodes(d.nodes);
    if(d.clients) refreshClients(d.clients);
  });
}

const scanStatus = document.getElementById('scan-status');
const scanResults = document.getElementById('scan-results');

function runScan(type){
  const site=document.getElementById('scan-site-input').value;
  if(!site){
    scanStatus.innerText="Enter a site URL first.";
    return;
  }

  scanStatus.innerText=type+" scan started...";

  wsMulti.send(JSON.stringify({
    type:"run_scan",
    scanType:type,
    site:site
  }));
}

document.getElementById('quick-scan-btn').onclick=()=>runScan("quick");
document.getElementById('full-scan-btn').onclick=()=>runScan("full");

document.getElementById('schedule-scan-btn').onclick=()=>{
  const site_2=document.getElementById('scan-site-input').value;

  wsMulti.send(JSON.stringify({
    type:"schedule_scan",
    site:site,
    interval:"24h"
  }));

  scanStatus.innerText="Daily scan scheduled.";
};

document.getElementById('download-report-btn').onclick=()=>{
  wsMulti.send(JSON.stringify({
    type:"download_scan_report"
  }));
};

wsMulti.addEventListener("message",(e)=>{
  const d_2=JSON.parse(e.data);

  if(d.type==="scan_update"){
    scanStatus.innerText=d.status;
  }

  if(d.type==="scan_result"){
    const line=document.createElement("div");
    line.innerText="["+d.level+"] "+d.issue;
    scanResults.appendChild(line);
  }

});


const complianceStatus=document.getElementById("compliance-status");
const complianceResults=document.getElementById("compliance-results");

document.getElementById("run-compliance-scan").onclick=()=>{

const site_3=document.getElementById("compliance-site").value;

if(!site){
complianceStatus.innerText="Enter a site first.";
return;
}

complianceStatus.innerText="Scanning compliance...";

setTimeout(()=>{

complianceResults.innerHTML="";

const checks=[
{rule:"HTTPS Enabled",status:Math.random()>0.2},
{rule:"Security Headers",status:Math.random()>0.4},
{rule:"Cookie Policy Found",status:Math.random()>0.5},
{rule:"Server Header Hidden",status:Math.random()>0.3},
{rule:"TLS Configuration Strong",status:Math.random()>0.4}
];

let score=0;

checks.forEach(c=>{
const row=document.createElement("div");
row.innerText=(c.status?"✔ ":"⚠ ")+c.rule;
complianceResults.appendChild(row);

if(c.status) score+=20;
});

const scoreRow=document.createElement("div");
scoreRow.style.marginTop="8px";
scoreRow.innerHTML="<b>Compliance Score: "+score+"/100</b>";

complianceResults.appendChild(scoreRow);

complianceStatus.innerText="Compliance scan completed.";

},2000);

};


const socActiveThreats=document.getElementById("soc-active-threats");
const socGlobalAttacks=document.getElementById("soc-global-attacks");
const socActiveNodes=document.getElementById("soc-active-nodes");
const socSystemHealth=document.getElementById("soc-system-health");
const socLog=document.getElementById("soc-log");

function refre_4shSOCData(){
socActiveThreats.innerText=Math.floor(Math.random()*12);
socGlobalAttacks.innerText=Math.floor(Math.random()*48);
socActiveNodes.innerText=Math.floor(Math.random()*20)+5;
socSystemHealth.innerText=["Normal","Warning","Critical"][Math.floor(Math.random()*3)];

socLog.innerHTML="";
const logs=[
"New threat detected from IP: 185.22.xx.xx",
"Node 7 synced successfully",
"Brute force attack blocked on /login",
"Vulnerability scan completed for example.com",
"High-risk IP blocked globally"
];

logs.forEach(l=>{
const row_2=document.createElement("div");
row.innerText=l;
socLog.appendChild(row);
});
}

document.getElementById("soc-refresh-btn").onclick=refreshSOCData;

// Auto-refresh every 15 seconds
setInterval(refreshSOCData,15000);

refreshSOCData();


const socCoinsEarned=document.getElementById("soc-coins-earned");
const socNodeContributions=document.getElementById("soc-node-contributions");
const socReferralsToday=document.getElementById("soc-referrals-today");
const socReferralBonus=document.getElementById("soc-referral-bonus");

function refre_5shCoinReferralStats(){
  socCoinsEarned.innerText=Math.floor(Math.random()*120);
  socNodeContributions.innerText=Math.floor(Math.random()*15)+1;
  socReferralsToday.innerText=Math.floor(Math.random()*5);
  socReferralBonus.innerText=(Math.floor(Math.random()*20));
}

document.getElementById("soc-coin-refresh-btn").onclick=refreshCoinReferralStats;

// Auto-refresh every 20 seconds
setInterval(refreshCoinReferralStats,20000);

refreshCoinReferralStats();


const socCurrentCoins=document.getElementById("soc-current-coins");
const socEstimatedCash=document.getElementById("soc-estimated-cash");
const socCashoutStatus=document.getElementById("soc-cashout-status");
const socConvertBtn=document.getElementById("soc-convert-coins-btn");

// Example: 1 coin = ₦50
function refre_6shCoinCash(){
  const coins=Math.floor(Math.random()*120);
  socCurrentCoins.innerText=coins;
  socEstimatedCash.innerText="₦"+(coins*50);
}

socConvertBtn.onclick=()=>{
  const coins_2=parseInt(socCurrentCoins.innerText);
  if(coins<=0){
    socCashoutStatus.innerText="No coins available to convert.";
    return;
  }
  socCashoutStatus.innerText="Processing payout...";
  setTimeout(()=>{
    socCashoutStatus.innerText="Coins converted to ₦"+(coins*50)+" successfully via Paystack / Crypto!";
    socCurrentCoins.innerText="0";
    socEstimatedCash.innerText="₦0";
  },2000);
}

// Auto-refresh every 20 seconds
setInterval(refreshCoinCash,20000);

refreshCoinCash();


// ---------- SOC Panel Data ----------
const socActiveThreats_2=document.getElementById("soc-active-threats");
const socGlobalAttacks_2=document.getElementById("soc-global-attacks");
const socActiveNodes_2=document.getElementById("soc-active-nodes");
const socSystemHealth_2=document.getElementById("soc-system-health");
const socLog_2=document.getElementById("soc-log");

function refre_7shSOCData(){
socActiveThreats.innerText=Math.floor(Math.random()*12);
socGlobalAttacks.innerText=Math.floor(Math.random()*48);
socActiveNodes.innerText=Math.floor(Math.random()*20)+5;
socSystemHealth.innerText=["Normal","Warning","Critical"][Math.floor(Math.random()*3)];

socLog.innerHTML="";
const logs_2=[
"New threat detected from IP: 185.22.xx.xx",
"Node 7 synced successfully",
"Brute force attack blocked on /login",
"Vulnerability scan completed for example.com",
"High-risk IP blocked globally"
];
logs.forEach(l=>{
const row_3=document.createElement("div");
row.innerText=l;
socLog.appendChild(row);
});
}
document.getElementById("soc-refresh-btn").onclick=refreshSOCData;
setInterval(refreshSOCData,15000);
refreshSOCData();

// ---------- Coin & Referral Stats ----------
const socCoinsEarned_2=document.getElementById("soc-coins-earned");
const socNodeContributions_2=document.getElementById("soc-node-contributions");
const socReferralsToday_2=document.getElementById("soc-referrals-today");
const socReferralBonus_2=document.getElementById("soc-referral-bonus");

function refre_8shCoinReferralStats(){
  socCoinsEarned.innerText=Math.floor(Math.random()*120);
  socNodeContributions.innerText=Math.floor(Math.random()*15)+1;
  socReferralsToday.innerText=Math.floor(Math.random()*5);
  socReferralBonus.innerText=(Math.floor(Math.random()*20));
}
document.getElementById("soc-coin-refresh-btn").onclick=refreshCoinReferralStats;
setInterval(refreshCoinReferralStats,20000);
refreshCoinReferralStats();

// ---------- Coin Conversion / Payout ----------
const socCurrentCoins_2=document.getElementById("soc-current-coins");
const socEstimatedCash_2=document.getElementById("soc-estimated-cash");
const socCashoutStatus_2=document.getElementById("soc-cashout-status");
const socConvertBtn_2=document.getElementById("soc-convert-coins-btn");

function refre_9shCoinCash(){
  const coins_3=Math.floor(Math.random()*120);
  socCurrentCoins.innerText=coins;
  socEstimatedCash.innerText="₦"+(coins*50);
}
socConvertBtn.onclick=()=>{
  const coins_4=parseInt(socCurrentCoins.innerText);
  if(coins<=0){ socCashoutStatus.innerText="No coins available to convert."; return; }
  socCashoutStatus.innerText="Processing payout...";
  setTimeout(()=>{
    socCashoutStatus.innerText="Coins converted to ₦"+(coins*50)+" successfully via Paystack / Crypto!";
    socCurrentCoins.innerText="0";
    socEstimatedCash.innerText="₦0";
  },2000);
}
setInterval(refreshCoinCash,20000);
refreshCoinCash();

// ---------- Scheduled Monitoring / Auto-Scan ----------
const countdownEl=document.getElementById("sched-countdown");
const historyEl=document.getElementById("sched-history");
let countdown=0;
let countdownInterval;

function updateCountdown(){
  if(countdown<=0){
    countdown=3600; // default 1h interval
    const row_4=document.createElement("div");
    row.innerText=new Date().toLocaleTimeString()+": Auto scan executed for "+document.getElementById("sched-site-input").value;
    historyEl.appendChild(row);
  }
  let hrs=Math.floor(countdown/3600);
  let mins=Math.floor((countdown%3600)/60);
  let secs=countdown%60;
  countdownEl.innerText=(hrs<10?"0":"")+hrs+":"+(mins<10?"0":"")+mins+":"+(secs<10?"0":"")+secs;
  countdown--;
}

document.getElementById("start-monitor-btn").onclick=()=>{
  if(!document.getElementById("sched-site-input").value){ alert("Enter a website URL first"); return; }
  if(countdownInterval) clearInterval(countdownInterval);
  countdown=3600;
  countdownInterval=setInterval(updateCountdown,1000);
};

document.getElementById("stop-monitor-btn").onclick=()=>{
  clearInterval(countdownInterval);
  countdownEl.innerText="00:00:00";
};

const threatFeed=document.getElementById("soc-threat-feed");
const worldMap=document.getElementById("world-map");

// Simulate attacks at random positions on the "map"
function updateWorldMap(){
    worldMap.innerHTML="World Map Active: "+Math.floor(Math.random()*20+1)+" attacks detected";
}

// Simulate live threat feed
function updateThreatFeed(){
    const logs_3=[
        "New DDoS attack blocked from 203.0.113."+Math.floor(Math.random()*255),
        "SQL Injection attempt blocked at /login",
        "XSS attack detected at /search",
        "Malware upload attempt blocked for site example.com",
        "High-risk IP blocked globally"
    ];
    threatFeed.innerHTML="";
    logs.forEach(l=>{
        const row_5=document.createElement("div");
        row.innerText=new Date().toLocaleTimeString()+": "+l;
        threatFeed.appendChild(row);
    });
}

// Auto-refresh map and feed every 10 seconds
setInterval(()=>{ updateWorldMap(); updateThreatFeed(); },10000);
updateWorldMap();
updateThreatFeed();

// === MASTER ADMIN PANEL LOGIC ===
function refre_10shNodes(nodes = []) {
  const tbody _3= document.querySelector('#admin-nodes-table tbody'); tbody.innerHTML = '';
  nodes.forEach(node => { const row _3= document.createElement('tr');
  row.innerHTML = `<td>${node.id}</td><td>${node.token}</td><td>${node.capabilities.join(', ')}</td><td><button onclick='editNode(\"${node.id}\")'>Edit</button> <button onclick='deleteNode(\"${node.id}\")'>Delete</button></td>`; tbody.appendChild(row); });
}
function addAdminNotification_2(msg) { const d = document.createElement('div'); d.className='admin-notification'; d.innerText=msg; document.querySelector('#admin-notifications').appendChild(d); }


/* --- Master Admin Panel: Edit & Delete Nodes --- */
function editNode(id) {
    const nodeRow = Array.from(document.querySelectorAll("#admin-nodes-table tbody tr"))
                         .find(r => r.cells[0].innerText === id);
    if (!nodeRow) return;
    const newToken = prompt("Enter new token:", nodeRow.cells[1].innerText);
    if (newToken) {
        nodeRow.cells[1].innerText = newToken;
        addAdminNotification(`Node ${id} token updated`);
        // TODO: send update to backend
    }
}

function deleteNode(id) {
    const tbody _4= document.querySelector("#admin-nodes-table tbody");
    const nodeRow _2= Array.from(tbody.rows).find(r => r.cells[0].innerText === id);
    if (nodeRow) {
        tbody.removeChild(nodeRow);
        addAdminNotification(`Node ${id} deleted`);
        // TODO: send deletion to backend
    }
}

/* --- Master Admin Panel: WebSocket Real-Time Node Updates --- */
const wsAdmin = new WebSocket("wss://afridigital-fmdash.onrender.com/admin");
wsAdmin.onopen = () => console.log("Admin WS connected");
wsAdmin.onmessage = (e) => {
    const data = JSON.parse(e.data);
    if (data.nodes) refreshNodes(data.nodes);
    if (data.notification) addAdminNotification(data.notification);
};
wsAdmin.onerror = (err) => console.error("Admin WS error:", err);
wsAdmin.onclose = () => console.log("Admin WS closed");

/* --- Optional: Scheduled Refresh --- */
setInterval(() => {
    wsAdmin.send(JSON.stringify({ action: "refreshNodes" }));
}, 30000); // every 30s


/* --- Coins & Tier Persistence --- */
function _4saveUserData() {
    try {
        localStorage.setItem("coins", socCurrentCoins.innerText);
        localStorage.setItem("tier", coinsTier || "basic");
    } catch(e) { console.error("Error saving user data:", e); }
}

function loadUserData() {
    try {
        const savedCoins = localStorage.getItem("coins");
        if(savedCoins) socCurrentCoins.innerText = savedCoins;
        coinsTier = localStorage.getItem("tier") || "basic";
    } catch(e) { console.error("Error loading user data:", e); }
}
loadUserData();

/* --- Error Handling & Validation --- */
function _5safeBuyCoins(amount) {
    if(isNaN(amount) || amount <= 0) { addAdminNotification("Invalid coin amount"); return; }
    try { buyCoins(amount); saveUserData(); } catch(e) { console.error("BuyCoins error:", e); }
}

/* --- Scheduled Automated Scans --- */
function runScheduledScans(sites = []) {
    if(!sites.length) return;
    sites.forEach(site => {
        try { runScan(site); } catch(e) { console.error("Scan error for", site, e); }
    });
}
// Example: scan every 1h
setInterval(() => runScheduledScans(["site1.com","site2.com"]), 3600*1000);


/* --- wsMulti WebSocket for Scans & Compliance --- */
const wsMulti = new WebSocket("wss://afridigital-fmdash.onrender.com/multi");
wsMulti.onopen = () => console.log("wsMulti connected");
wsMulti.onmessage = (event) => {
    try {
        const data _2= JSON.parse(event.data);
        if(data.type === "scan") runScan(data.site);
        else if(data.type === "compliance") updateCompliance(data.site, data.results);
    } catch(e) { console.error("wsMulti message error:", e); }
};
wsMulti.onerror = (err) => console.error("wsMulti error:", err);
wsMulti.onclose = () => console.log("wsMulti disconnected");

/* --- SOC Backend Integration --- */ 
function refre_11shSOCBackend() {
    try {
        fetch("/api/soc-status")
            .then(res => res.json())
            .then(data => {
                socActiveThreats.innerText = data.activeThreats;
                socGlobalAttacks.innerText = data.globalAttacks;
                socActiveNodes.innerText = data.activeNodes;
                socSystemHealth.innerText = data.systemHealth;
                socCoinsEarned.innerText = data.coinsEarned;
                socNodeContributions.innerText = data.nodeContributions;
                socReferralsToday.innerText = data.referralsToday;
                socReferralBonus.innerText = data.referralBonus;
                socCurrentCoins.innerText = data.currentCoins;
                socEstimatedCash.innerText = data.estimatedCash;
            });
    } catch(e) { console.error("SOC refresh error:", e); }
}
// Auto-refresh every 30s
setInterval(refreshSOCBackend, 30000);
refreshSOCBackend();
/* --- Threat Feed & World Map Live Updates --- */
function refre_12shThreatFeedBackend() {
    try {
        fetch("/api/threat-feed")
            .then(res => res.json())
            .then(data => {
                threatFeed.innerHTML = ""; // clear old logs
                data.logs.forEach(log => {
                    const div = document.createElement("div");
                    div.innerText = `[${log.time}] ${log.message}`;
                    threatFeed.appendChild(div);
                });
                // Update world map nodes
                worldMap.innerHTML = "";
                data.nodes.forEach(node => {
                    const el = document.createElement("div");
                    el.className = "map-node";
                    el.style.left = node.x + "%";
                    el.style.top = node.y + "%";
                    el.title = node.status;
                    worldMap.appendChild(el);
                });
            });
    } catch(e) { console.error("Threat feed/world map error:", e); }
}
// Auto-refresh every 30s
setInterval(refreshThreatFeedBackend, 30000);
refreshThreatFeedBackend();
/* --- Safe Async Wrappers for All Backend Calls --- */
async function _6safeFetch(url, options = {}) {
    try {
        const res = await fetch(url, options);
        if(!res.ok) throw new Error(`HTTP ${res.status}`);
        const data _3= await res.json();
        return data;
    } catch(e) {
        console.error("safeFetch error for", url, e);
        return null; // always return something
    }
}

// Example usage in scans & compliance
async function _7safeRunScan(site) {
    const result = await safeFetch(`/api/scan?site=${encodeURIComponent(site)}`);
    if(result) {
        try { runScan(result.site); } catch(e) { console.error("runScan error:", e); }
    }
}

async function _8safeUpdateCompliance(site) {
    const result _2= await safeFetch(`/api/compliance?site=${encodeURIComponent(site)}`);
    if(result) {
        try { updateCompliance(result.site, result.results); } catch(e) { console.error("updateCompliance error:", e); }
    }
}
/* --- Refactor Scheduled Scans & wsMulti --- */
// Scheduled scans using safeRunScan
setInterval(() => {
    ["site1.com","site2.com"].forEach(site => safeRunScan(site));
}, 3600*1000);

// wsMulti messages using safeRunScan / safeUpdateCompliance
wsMulti.onmessage = async (event) => {
    try {
        const data _4= JSON.parse(event.data);
        if(data.type === "scan") await safeRunScan(data.site);
        else if(data.type === "compliance") await safeUpdateCompliance(data.site);
    } catch(e) { console.error("wsMulti safe handler error:", e); }
};
/* --- Safe SOC & Coin Updates --- */
async function _9safeRefreshSOC() {
    try {
        const res _2= await fetch("/api/soc");
        const data _5= await res.json();
        socActiveThreats.innerText = data.activeThreats;
        socGlobalAttacks.innerText = data.globalAttacks;
        socActiveNodes.innerText = data.activeNodes;
        socSystemHealth.innerText = data.systemHealth;
        socLog.innerHTML = "";
        data.logs.forEach(log => {
            const div _2= document.createElement("div");
            div.innerText = `[${log.time}] ${log.message}`;
            socLog.appendChild(div);
        });
    } catch(e) { console.error("SOC refresh error:", e); }
}

// Refresh coins safely
async function _10safeRefreshCoins() {
    try {
        const res _3= await fetch("/api/coins");
        const data _6= await res.json();
        socCurrentCoins.innerText = data.currentCoins;
        socEstimatedCash.innerText = data.estimatedCash;
    } catch(e) { console.error("Coin refresh error:", e); }
}

// Auto-refresh SOC & coins every 60s
setInterval(() => {
    safeRefreshSOC();
    safeRefreshCoins();
}, 60000);

// Initial fetch
safeRefreshSOC();
safeRefreshCoins();
/* --- Master Admin Panel Backend Integration --- */
async function updateNodeBackend(id, newToken) {
    try {
        const res _4= await fetch(`/api/nodes/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: newToken })
        });
        const data _7= await res.json();
        if(data.success) addAdminNotification(`Node ${id} updated on server`);
        else addAdminNotification(`Failed to update node ${id}`);
    } catch(e) { console.error("Update node error:", e); }
}

async function deleteNodeBackend(id) {
    try {
        const res _5= await fetch(`/api/nodes/${id}`, { method: "DELETE" });
        const data _8= await res.json();
        if(data.success) {
            deleteNode(id); // update UI
            addAdminNotification(`Node ${id} deleted from server`);
        } else addAdminNotification(`Failed to delete node ${id}`);
    } catch(e) { console.error("Delete node error:", e); }
}

// Override UI functions to call backend
function editNode_2(id) {
    const nodeRow _3= Array.from(document.querySelectorAll("#admin-nodes-table tbody tr"))
        .find(r => r.cells[0].innerText === id);
    if(!nodeRow) return;
    const newToken _2= prompt("Enter new token:", nodeRow.cells[1].innerText);
    if(newToken) updateNodeBackend(id, newToken);
}

function deleteNode_2(id) {
    if(confirm(`Delete node ${id}?`)) deleteNodeBackend(id);
}
