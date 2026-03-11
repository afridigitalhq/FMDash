const apiKey = 'AfriDigital-FMDash-API-Key';

let scans = [];

function updateDashboard(filteredScans) {
  let high = 0, medium = 0, low = 0;
  const table = document.getElementById('scan-table');
  table.innerHTML = '';
  filteredScans.forEach(scan => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${scan.target}</td><td>${scan.vulnerability}</td><td>${scan.severity}</td><td>${scan.timestamp}</td>`;
    table.appendChild(row);
    if(scan.severity === 'High') high++;
    else if(scan.severity === 'Medium') medium++;
    else if(scan.severity === 'Low') low++;
  });
  document.getElementById('high').textContent = `High: ${high}`;
  document.getElementById('medium').textContent = `Medium: ${medium}`;
  document.getElementById('low').textContent = `Low: ${low}`;
}

// Fetch live scans from backend
const API_KEY="AfriDigital-FMDash-API-Key"; const API_KEY="AfriDigital-FMDash-API-Key"; const API_KEY="AfriDigital-FMDash-API-Key"; fetch("https://afridigital-fmdash.onrender.com/admin/test",{headers:{"x-api-key":API_KEY}})
  .then(res => res.json())
  .then(data => { scans = data.scans || []; updateDashboard(scans); })
  .catch(err => console.error('Error fetching scans:', err));

// Search filter
document.getElementById('search').addEventListener('input', e => {
  const term = e.target.value.toLowerCase();
  const filtered = scans.filter(scan => scan.target.toLowerCase().includes(term) || scan.severity.toLowerCase().includes(term));
  updateDashboard(filtered);
});

// Test scan button
document.getElementById('scanBtn').addEventListener('click', () => {
  const newScan = { target: 'afrilove.com', vulnerability: 'Test Vulnerability', severity: ['High','Medium','Low'][Math.floor(Math.random()*3)], timestamp: new Date().toLocaleString() };
  scans.push(newScan);
  updateDashboard(scans);
});
