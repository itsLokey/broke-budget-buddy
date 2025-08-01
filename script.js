document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("budget-form");
  const addBillBtn = document.getElementById("add-bill");
  const billsContainer = document.getElementById("bills-container");
  const results = document.getElementById("results");
  const summary = document.getElementById("summary");
  const breakdown = document.getElementById("spending-breakdown");
  const smartAdvice = document.getElementById("smart-advice");
  const exportBtn = document.getElementById("export-pdf");
  let budgetChart;

  function createBillRow() {
    const div = document.createElement("div");
    div.className = "bill-group";
    div.innerHTML = `
      <select class="bill-name">
        <option value="Rent">Rent</option>
        <option value="Utilities">Utilities</option>
        <option value="Groceries">Groceries</option>
        <option value="Transportation">Transportation</option>
        <option value="Phone">Phone</option>
        <option value="Internet">Internet</option>
        <option value="Insurance">Insurance</option>
        <option value="Debt">Debt Repayment</option>
        <option value="Subscriptions">Subscriptions</option>
        <option value="Childcare">Childcare</option>
      </select>
      <input type="number" class="bill-amount" placeholder="Amount" required />
      <button type="button" class="remove-bill">X</button>
    `;
    billsContainer.appendChild(div);

    div.querySelector(".remove-bill").onclick = () => div.remove();
  }

  addBillBtn.onclick = () => createBillRow();

  form.onsubmit = (e) => {
    e.preventDefault();
    const income = parseFloat(document.getElementById("user-income").value) || 0;
    const partnerIncome = parseFloat(document.getElementById("partner-income").value) || 0;
    const totalIncome = income + partnerIncome;

    const bills = [];
    const names = document.querySelectorAll(".bill-name");
    const amounts = document.querySelectorAll(".bill-amount");

    for (let i = 0; i < names.length; i++) {
      const name = names[i].value;
      const amount = parseFloat(amounts[i].value) || 0;
      bills.push({ name, amount });
    }

    const totalBills = bills.reduce((sum, bill) => sum + bill.amount, 0);
    const remaining = totalIncome - totalBills;

    summary.innerHTML = `
      <p><strong>Total Income:</strong> $${totalIncome.toFixed(2)}</p>
      <p><strong>Total Expenses:</strong> $${totalBills.toFixed(2)}</p>
      <p><strong>Remaining:</strong> $${remaining.toFixed(2)}</p>
    `;

    breakdown.innerHTML = "";
    bills.forEach(bill => {
      const li = document.createElement("li");
      li.textContent = `${bill.name}: $${bill.amount.toFixed(2)}`;
      breakdown.appendChild(li);
    });

    generateAdvice(remaining, bills, totalIncome);
    generateChart(bills, totalIncome);
    results.style.display = "block";
  };

  function generateAdvice(remaining, bills, income) {
    let advice = "";
    if (remaining < 0) {
      advice += `<p>⚠️ You're spending more than you earn. Cut unnecessary expenses like subscriptions or renegotiate bills.</p>`;
    } else if (remaining > income * 0.2) {
      advice += `<p>✅ Great job! Consider saving or investing the remaining $${remaining.toFixed(2)}.</p>`;
    } else {
      advice += `<p>💡 You're close to balanced. Track smaller expenses to improve.</p>`;
    }

    smartAdvice.innerHTML = advice;
  }

  function generateChart(bills, income) {
    if (budgetChart) budgetChart.destroy();

    const ctx = document.getElementById("budget-chart").getContext("2d");
    const labels = bills.map(b => b.name);
    const data = bills.map(b => b.amount);

    budgetChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: [
            '#007bff', '#28a745', '#ffc107', '#dc3545', '#17a2b8',
            '#6610f2', '#fd7e14', '#6f42c1', '#20c997', '#e83e8c'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: { enabled: true }
        }
      }
    });
  }

  exportBtn.onclick = async () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const resultsEl = document.getElementById("results");

    await html2canvas(resultsEl).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const imgProps = doc.getImageProperties(imgData);
      const pdfWidth = doc.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      doc.save("budget-summary.pdf");
    });
  };
});
