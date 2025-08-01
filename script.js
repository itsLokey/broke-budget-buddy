document.addEventListener('DOMContentLoaded', () => {
  const billSelect = document.getElementById('bill-select');
  const billAmount = document.getElementById('bill-amount');
  const addBillBtn = document.getElementById('add-bill-btn');
  const billList = document.getElementById('bill-list');
  const form = document.getElementById('budget-form');
  const summaryDiv = document.getElementById('summary');
  const resultsSection = document.getElementById('results');
  const exportBtn = document.getElementById('export-pdf-btn');

  let bills = [];

  addBillBtn.onclick = () => {
    const name = billSelect.value;
    const amount = parseFloat(billAmount.value);

    if (!name || isNaN(amount) || amount <= 0) {
      alert("Please select a bill and enter a valid amount.");
      return;
    }

    const id = `${name}-${Date.now()}`;
    bills.push({ id, name, amount });

    const li = document.createElement('li');
    li.innerHTML = `${name}: $${amount.toFixed(2)} <button class="remove-btn" data-id="${id}">Remove</button>`;
    billList.appendChild(li);

    li.querySelector('.remove-btn').addEventListener('click', () => {
      bills = bills.filter(b => b.id !== id);
      li.remove();
    });

    billSelect.value = '';
    billAmount.value = '';
  };

  form.onsubmit = (e) => {
    e.preventDefault();
    const income = parseFloat(document.getElementById('income').value) || 0;
    const partnerIncome = parseFloat(document.getElementById('partnerIncome').value) || 0;
    const totalIncome = income + partnerIncome;
    const totalExpenses = bills.reduce((acc, bill) => acc + bill.amount, 0);
    const remaining = totalIncome - totalExpenses;

    summaryDiv.innerHTML = `
      <p><strong>Total Income:</strong> $${totalIncome.toFixed(2)}</p>
      <p><strong>Total Bills:</strong> $${totalExpenses.toFixed(2)}</p>
      <p><strong>Remaining:</strong> $${remaining.toFixed(2)}</p>
    `;

    updateProgressBar(totalExpenses, totalIncome);
    generateChart(bills);
    showAdvice(remaining);
    resultsSection.classList.remove('hidden');
    document.getElementById('summary-title').classList.remove('hidden');
    document.getElementById('progress-section').classList.remove('hidden');
    document.getElementById('chart-title').classList.remove('hidden');
    document.getElementById('advice-title').classList.remove('hidden');
    exportBtn.classList.remove('hidden');
  };

  exportBtn.onclick = () => {
    const element = document.getElementById('results');
    html2pdf().from(element).save("budget-summary.pdf");
  };

  function updateProgressBar(spent, income) {
    const percentage = income === 0 ? 0 : Math.min(100, (spent / income) * 100);
    const bar = document.getElementById('progress-bar');
    const text = document.getElementById('progress-text');
    bar.style.width = percentage + '%';
    text.textContent = `You’ve used ${percentage.toFixed(1)}% of your budget.`;
  }

  function generateChart(data) {
    const ctx = document.getElementById('budgetChart').getContext('2d');
    if (window.budgetChart) window.budgetChart.destroy();
    window.budgetChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: data.map(b => b.name),
        datasets: [{
          data: data.map(b => b.amount),
          backgroundColor: [
            '#3498db', '#2ecc71', '#e74c3c', '#f1c40f', '#9b59b6',
            '#1abc9c', '#34495e', '#e67e22', '#95a5a6', '#7f8c8d'
          ]
        }]
      }
    });
  }

  function showAdvice(remaining) {
    const advice = document.getElementById('advice');
    if (remaining > 300) {
      advice.innerHTML = `<p>You’re doing great! Consider saving or investing.</p>`;
    } else if (remaining > 0) {
      advice.innerHTML = `<p>You're on track. Watch discretionary spending.</p>`;
    } else {
      advice.innerHTML = `<p><strong>Warning:</strong> You're overspending. Consider reducing non-essential bills.</p>`;
    }
  }
});
