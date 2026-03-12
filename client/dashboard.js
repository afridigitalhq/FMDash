async function loadScanResults() {
  try {
    const res = await fetch('/api/scan-results');
    const data = await res.json();

    const table = document.getElementById("scan-results");
    table.innerHTML = "";

    data.forEach(scan => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${scan.target}</td>
        <td>${scan.vulnerability}</td>
        <td>${scan.severity}</td>
        <td>${scan.timestamp}</td>
      `;

      table.appendChild(row);
    });

  } catch (err) {
    console.error("Error loading scan results:", err);
  }
}

// Load once
loadScanResults();

// Auto refresh every 10 seconds
setInterval(loadScanResults, 10000);
