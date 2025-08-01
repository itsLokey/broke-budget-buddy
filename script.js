document.addEventListener("DOMContentLoaded", () => {
  const billSelect = document.getElementById("bill-select");
  const billAmount = document.getElementById("bill-amount");
  const addBillBtn = document.getElementById("add-bill-btn");
  const billList = document.getElementById("bill-list");
  const budgetForm = document.getElementById("budget-form");
  const resultsSection = document.getElementById("results");
  const summaryDiv = document.getElementById("summary");
  const progressBar = document.getElementById("progress-bar");
  const progressText = document.getElementById("progress-text");
  const adviceDiv = document.getElementById("advice");
  const chartCanvas = document.getElementById("budgetChart");
  const exportBtn = document.getElementById("export-pdf-btn");

  let bills = [];

  addBillBtn.onclick = () => {
    const name = billSelect.value;
    const amount = parseFloat(billAmount.value);
    if (!name || isNaN(amount)) return alert("Please select a bill and enter amount.");

    bills.push({ name, amount });

    const li = document.createElement("li");
    li.textContent = `${name}: $${amount.toFixed(2)}`;

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    removeBtn.onclick = () => {
      bills = bills.filter(b => !(b.name === name && b.amount === amount));
      billList.removeChild(li);
    };

    li.appendChild(removeBtn);
    billList.appendChild(li);

    billSelect.value = "";
    billAmount.value = "";
  };

  budgetForm.onsubmit = (e) => {
    e.preventDefault();

    const income = parseFloat(document.getElementById("income").value || 0);
    const partnerIncome = parseFloat(document.getElementById("partnerIncome").value || 0);
    const totalIncome = income + partnerIncome;
    const totalExpenses = bills.reduce((sum, bill) => sum + bill.amount, 0);
    const leftover = totalIncome - totalExpenses;

    summaryDiv.innerHTML = `
      <p>Total Income: <strong>$${totalIncome.toFixed(2)}</strong></p>
      <p>Total Expenses: <strong>$${totalExpenses.toFixed(2)}</strong></p>
      <p>Leftover: <strong>$${leftover.toFixed(2)}</strong></p>
    `;

    const percentUsed = (totalExpenses / totalIncome) * 100;
    progressBar.style.width = `${percentUsed}%`;
    progressText.textContent = `${percentUsed.toFixed(1)}% of your income is used`;

    const ctx = chartCanvas.getContext("2d");
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: bills.map(b => b.name),
        datasets: [{
          data: bills.map(b => b.amount),
          backgroundColor: ['#66bb6a', '#42a5f5', '#ffca28', '#ef5350', '#ab47bc', '#ffa726', '#26c6da', '#8d6e63', '#789262']
        }]
      }
    });

    adviceDiv.innerHTML = leftover > 0
      ? `<p>You're doing well! Consider saving or investing $${leftover.toFixed(2)}.</p>`
      : `<p>You're over budget by $${Math.abs(leftover).toFixed(2)}. Consider reducing discretionary bills.</p>`;

    resultsSection.classList.remove("hidden");
  };

  exportBtn.onclick = () => {
    html2pdf().from(document.getElementById("results")).save("budget-summary.pdf");
  };
});
