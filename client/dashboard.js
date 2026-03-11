let scans = [
  { target: "afrilove.com", vulnerability: "SQL Injection", severity: "High", timestamp: "2026-03-10 09:00" },
  { target: "afrilove.com", vulnerability: "XSS", severity: "Medium", timestamp: "2026-03-10 09:05" },
  { target: "afrilove.com", vulnerability: "Missing HTTPS", severity: "Low", timestamp: "2026-03-10 09:10" }
];

function updateDashboard(filteredScans) {
  let high = 0, medium = 0, low = 0;
  const table = document.getElementById("scan-table");
  table.innerHTML = "";

  filteredScans.forEach(scan => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${scan.target}</td>
      <td>${scan.vulnerability}</td>
      <td>${scan.severity}</td>
      <td>${scan.timestamp}</td>
    `;
    table.appendChild(row);

    if(scan.severity === "High") high++;
    else if(scan.severity === "Medium") medium++;
    else if(scan.severity === "Low") low++;
  });

  document.getElementById("high").textContent = `High: ${high}`;
  document.getElementById("medium").textContent = `Medium: ${medium}`;
  document.getElementById("low").textContent = `Low: ${low}`;
}

// Initial display
updateDashboard(scans);

// Search filter
document.getElementById("search").addEventListener("input", (e) => {
  const term = e.target.value.toLowerCase();
  const filtered = scans.filter(scan =>
    scan.target.toLowerCase().includes(term) || scan.severity.toLowerCase().includes(term)
  );
  updateDashboard(filtered);
});

// Test scan button (adds a fake scan entry)
document.getElementById("scanBtn").addEventListener("click", () => {
  const newScan = {
    target: "afrilove.com",
    vulnerability: "Test Vulnerability",
    severity: ["High","Medium","Low"][Math.floor(Math.random()*3)],
    timestamp: new Date().toLocaleString()
  };
  scans.push(newScan);
  updateDashboard(scans);
});
