document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('budget-form');
  const billSelector = document.getElementById('bill-selector');
  const billAmount = document.getElementById('bill-amount');
  const addBillBtn = document.getElementById('add-bill-btn');
  const billList = document.getElementById('bill-list');
  const resultsSection = document.getElementById('results');
  const summaryDiv = document.getElementById('summary');
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');
  const adviceDiv = document.getElementById('advice');
  const exportBtn = document.getElementById('export-pdf-btn');
  const chartCanvas = document.getElementById('budgetChart');

  let chart;
  let bills = [];

  addBillBtn.onclick = () => {
    const name = billSelector.value;
    const amount = parseFloat(billAmount.value);

    if (!name || isNaN(amount) || amount <= 0) return;

    bills.push({ name, amount });

    const li = document.createElement('li');
    li.textContent = `${name}: $${amount.toFixed(2)}`;
    billList.appendChild(li);

    billSelector.value = '';
    billAmount.value = '';
  };

  form.onsubmit = (e) => {
    e.preventDefault();

    const income = parseFloat(document.getElementById('income').value) || 0;
    const partnerIncome = parseFloat(document.getElementById('partnerIncome').value) || 0;
    const totalIncome = income + partnerIncome;

    const totalExpenses = bills.reduce((sum, bill) => sum + bill.amount, 0);
    const remaining = totalIncome - totalExpenses;

    summaryDiv.innerHTML = `
      <p><strong>Total Income:</strong> $${totalIncome.toFixed(2)}</p>
      <p><strong>Total Expenses:</strong> $${totalExpenses.toFixed(2)}</p>
      <p><strong>Remaining:</strong> $${remaining.toFixed(2)}</p>
    `;

    const percentUsed = totalIncome ? Math.min((totalExpenses / totalIncome) * 100, 100) : 0;
    progressBar.style.width = `${percentUsed}%`;
    progressText.textContent = `You've used ${percentUsed.toFixed(1)}% of your income.`;

    adviceDiv.textContent =
      remaining > 0
        ? "Great! You're spending less than you earn."
        : "Warning: You're spending more than your income.";

    resultsSection.classList.remove('hidden');
    document.querySelectorAll('.hidden-content').forEach(el => el.style.display = '');

    if (chart) chart.destroy();
    chart = new Chart(chartCanvas, {
      type: 'pie',
      data: {
        labels: bills.map(b => b.name),
        datasets: [{
          label: 'Expenses',
          data: bills.map(b => b.amount),
          backgroundColor: [
            '#3498db', '#1abc9c', '#f39c12', '#9b59b6',
            '#e74c3c', '#2ecc71', '#34495e', '#fd79a8',
            '#e67e22', '#95a5a6'
          ]
        }]
      }
    });
  };

  exportBtn.onclick = () => {
    const element = document.getElementById('results');
    html2pdf().from(element).save('budget_summary.pdf');
  };
});
