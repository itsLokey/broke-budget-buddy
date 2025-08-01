document.addEventListener("DOMContentLoaded", () => {
  const budgetForm = document.getElementById("budget-form");
  const billList = document.getElementById("bill-list");
  const addBillBtn = document.getElementById("add-bill");
  const results = document.getElementById("results");
  const summaryDiv = document.getElementById("summary");
  const breakdownList = document.getElementById("breakdown-list");
  const adviceDiv = document.getElementById("advice");
  const exportBtn = document.getElementById("export");
  let budgetChart;

  function createBillField() {
    const div = document.createElement("div");
    div.className = "bill-field";
    div.innerHTML = `
      <select class="bill-type">
        <option value="Rent">Rent</option>
        <option value="Utilities">Utilities</option>
        <option value="Groceries">Groceries</option>
        <option value="Transportation">Transportation</option>
        <option value="Phone">Phone</option>
        <option value="Internet">Internet</option>
        <option value="Childcare">Childcare</option>
        <option value="Debt">Debt</option>
        <option value="Subscriptions">Subscriptions</option>
        <option value="Insurance">Insurance</option>
        <option value="Other">Other</option>
      </select>
      <input type="number" class="bill-amount" placeholder="$ Amount" />
      <button type="button" class="remove-bill">✖</button>
    `;
    billList.appendChild(div);
  }

  billList.addEventListener("click", (e) => {
    if (e.target.classList.contains("remove-bill")) {
      e.target.parentElement.remove();
    }
  });

  addBillBtn.addEventListener("click", createBillField);

  budgetForm.onsubmit = (e) => {
    e.preventDefault();

    const income = parseFloat(document.getElementById("income").value) || 0;
    const partner = parseFloat(document.getElementById("partner-income").value) || 0;
    const extra = parseFloat(document.getElementById("extra-income").value) || 0;
    const totalIncome = income + partner + extra;

    const bills = [];
    const billTypes = document.querySelectorAll(".bill-type");
    const billAmounts = document.querySelectorAll(".bill-amount");

    billTypes.forEach((typeEl, i) => {
      const type = typeEl.value;
      const amount = parseFloat(billAmounts[i].value) || 0;
      bills.push({ type, amount });
    });

    const totalBills = bills.reduce((acc, b) => acc + b.amount, 0);
    const remaining = totalIncome - totalBills;

    summaryDiv.innerHTML = `
      <p><strong>Total Income:</strong> $${totalIncome.toFixed(2)}</p>
      <p><strong>Total Bills:</strong> $${totalBills.toFixed(2)}</p>
      <p><strong>Remaining Balance:</strong> $${remaining.toFixed(2)}</p>
    `;

    generateChart(bills, totalBills, remaining);
    generateAdvice(remaining, bills, totalIncome);

    breakdownList.innerHTML = "";
    bills.forEach(bill => {
      const li = document.createElement("li");
      li.textContent = `${bill.type}: $${bill.amount.toFixed(2)}`;
      breakdownList.appendChild(li);
    });

    results.classList.remove("hidden");
  };

  function generateChart(bills, totalBills, remaining) {
    const ctx = document.getElementById("budgetChart").getContext("2d");

    if (budgetChart) budgetChart.destroy();

    const labels = bills.map(b => b.type).concat("Remaining");
    const data = bills.map(b => b.amount).concat(remaining > 0 ? remaining : 0);

    budgetChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels,
        datasets: [{
          label: "Budget Breakdown",
          data,
          backgroundColor: [
            "#3498db", "#2ecc71", "#e67e22", "#e74c3c",
            "#9b59b6", "#f1c40f", "#1abc9c", "#34495e",
            "#d35400", "#7f8c8d", "#95a5a6"
          ],
          borderColor: "#fff",
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "bottom" },
          tooltip: { enabled: true }
        }
      }
    });
  }

  function generateAdvice(remaining, bills, income) {
    let advice = "";

    if (remaining < 0) {
      advice += `<p>⚠️ <strong>You are overspending by $${Math.abs(remaining).toFixed(2)}</strong>. Consider cutting unnecessary expenses.</p>`;
    } else if (remaining < income * 0.1) {
      advice += `<p>✅ You're doing okay, but your remaining balance is low. Watch your spending this month.</p>`;
    } else {
      advice += `<p>💰 Great job! You have room to save or invest.</p>`;
    }

    const highBill = bills.reduce((prev, curr) => (curr.amount > prev.amount ? curr : prev), bills[0]);
    if (highBill) {
      advice += `<p>📊 Highest expense: <strong>${highBill.type}</strong> ($${highBill.amount.toFixed(2)}). See if this can be reduced.</p>`;
    }

    adviceDiv.innerHTML = advice;
  }

  exportBtn.addEventListener("click", () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Broke Budget Summary", 20, 20);

    let y = 30;
    summaryDiv.querySelectorAll("p").forEach(p => {
      doc.setFontSize(12);
      doc.text(p.textContent, 20, y);
      y += 10;
    });

    y += 10;
    doc.setFontSize(14);
    doc.text("Spending Breakdown", 20, y);
    y += 10;
    breakdownList.querySelectorAll("li").forEach(li => {
      doc.text(li.textContent, 20, y);
      y += 8;
    });

    y += 10;
    doc.setFontSize(14);
    doc.text("Advice", 20, y);
    y += 10;
    adviceDiv.querySelectorAll("p").forEach(p => {
      doc.setFontSize(12);
      doc.text(p.textContent, 20, y);
      y += 8;
    });

    doc.save("budget-summary.pdf");
  });

  createBillField(); // Start with one bill
});
