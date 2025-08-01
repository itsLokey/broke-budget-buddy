document.addEventListener('DOMContentLoaded', () => {
  const addBillBtn = document.getElementById('add-bill');
  const billType = document.getElementById('bill-type');
  const billAmount = document.getElementById('bill-amount');
  const billList = document.getElementById('bill-list');
  const budgetForm = document.getElementById('budget-form');
  const resultsSection = document.getElementById('results');
  const summaryDiv = document.getElementById('summary');
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');
  const adviceDiv = document.getElementById('advice');
  const exportBtn = document.getElementById('export-pdf-btn');

  let bills = [];

  addBillBtn.onclick = () => {
    const type = billType.value;
    const amount = parseFloat(billAmount.value);
    if (!type || isNaN(amount) || amount <= 0) return;

    const existing = bills.find(b => b.type === type);
    if (existing) {
      existing.amount += amount;
    } else {
      bills.push({ type, amount });
    }

    billType.value = '';
    billAmount.value = '';
    renderBillList();
  };

  function renderBillList() {
    billList.innerHTML = '';
    bills.forEach((bill, index) => {
      const li = document.createElement('li');
      li.innerHTML = `
        ${bill.type}: $${bill.amount.toFixed(2)}
        <button data-index="${index}">X</button>
      `;
      billList.appendChild(li);
    });

    document.querySelectorAll('#bill-list button').forEach(btn => {
      btn.onclick = () => {
        const i = parseInt(btn.dataset.index);
        bills.splice(i, 1);
        renderBillList();
      };
    });
  }

  budgetForm.onsubmit = (e) => {
    e.preventDefault();
    const income = parseFloat(document.getElementById('income').value) || 0;
    const partnerIncome = parseFloat(document.getElementById('partnerIncome').value) || 0;
    const totalIncome = income + partnerIncome;
    const totalExpenses = bills.reduce((sum, bill) => sum + bill.amount, 0);
    const balance = totalIncome - totalExpenses;

    resultsSection.classList.remove('hidden');

    summaryDiv.innerHTML = `
      <p><strong>Total Income:</strong> $${totalIncome.toFixed(2)}</p>
      <p><strong>Total Expenses:</strong> $${totalExpenses.toFixed(2)}</p>
      <p><strong>Remaining:</strong> $${balance.toFixed(2)}</p>
    `;

    const usagePercent = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;
    progressBar.style.width = `${Math.min(usagePercent, 100)}%`;
    progressBar.style.backgroundColor = usagePercent > 100 ? 'red' : '#28a745';
    progressText.textContent = usagePercent > 100
      ? `Over budget by ${Math.abs(balance).toFixed(2)}`
      : `You're using ${usagePercent.toFixed(1)}% of your budget`;

    generateChart();
    giveAdvice(balance, usagePercent);
  };

  function generateChart() {
    const ctx = document.getElementById('budgetChart').getContext('2d');
    if (window.budgetChart) window.budgetChart.destroy();

    window.budgetChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: bills.map(b => b.type),
        datasets: [{
          label: 'Spending Breakdown',
          data: bills.map(b => b.amount),
          backgroundColor: [
            '#007bff', '#28a745', '#ffc107', '#dc3545', '#17a2b8',
            '#6f42c1', '#fd7e14', '#20c997', '#e83e8c', '#343a40'
          ],
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: { callbacks: {
            label: (ctx) => `${ctx.label}: $${ctx.raw.toFixed(2)}`
          }}
        }
      }
    });
  }

  function giveAdvice(balance, percent) {
    let msg = '';
    if (percent > 100) {
      msg = 'You are spending more than your income! Cut unnecessary costs immediately.';
    } else if (percent > 90) {
      msg = 'You’re on the edge. Consider reducing non-essential bills like subscriptions.';
    } else if (percent > 75) {
      msg = 'You’re doing okay, but try to aim for under 70% spending if possible.';
    } else {
      msg = 'Nice job! You’re living below your means. Consider saving or investing.';
    }
    adviceDiv.textContent = msg;
  }

  exportBtn.onclick = () => {
    html2pdf().from(resultsSection).save('BudgetSummary.pdf');
  };
});
