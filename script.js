document.addEventListener('DOMContentLoaded', function () {
  const billList = document.getElementById('billList');
  const addBillBtn = document.getElementById('addBill');
  const budgetForm = document.getElementById('budgetForm');
  const summary = document.getElementById('summary');
  const breakdown = document.getElementById('breakdown');
  const adviceSection = document.getElementById('adviceSection');
  const chartContainer = document.getElementById('chartContainer');
  const exportBtn = document.getElementById('exportPDF');

  const billOptions = [
    'Rent/Mortgage',
    'Utilities',
    'Internet',
    'Phone',
    'Groceries',
    'Insurance',
    'Transportation',
    'Subscriptions',
    'Childcare',
    'Loan Payments',
    'Other'
  ];

  let billCount = 0;
  let budgetChart;

  function createBillField() {
    const div = document.createElement('div');
    div.classList.add('bill-group');
    div.innerHTML = `
      <select name="billName" required>
        ${billOptions.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
      </select>
      <input type="number" name="billAmount" placeholder="Amount ($)" required min="0" step="0.01">
      <button type="button" class="remove-bill">Remove</button>
    `;
    billList.appendChild(div);

    div.querySelector('.remove-bill').addEventListener('click', () => {
      billList.removeChild(div);
    });
  }

  addBillBtn.addEventListener('click', createBillField);
  createBillField(); // initial field

  budgetForm.onsubmit = function (e) {
    e.preventDefault();

    const income = parseFloat(document.getElementById('income').value);
    const bills = [...document.querySelectorAll('#billList .bill-group')].map(group => ({
      name: group.querySelector('select').value,
      amount: parseFloat(group.querySelector('input').value)
    }));

    const totalBills = bills.reduce((sum, b) => sum + b.amount, 0);
    const remaining = income - totalBills;
    const percentage = ((totalBills / income) * 100).toFixed(1);

    document.getElementById('summary').innerHTML = `
      <h3>Budget Summary</h3>
      <p><strong>Total Income:</strong> $${income.toFixed(2)}</p>
      <p><strong>Total Bills:</strong> $${totalBills.toFixed(2)}</p>
      <p><strong>Remaining:</strong> $${remaining.toFixed(2)}</p>
    `;

    document.getElementById('breakdown').innerHTML = `
      <h3>Spending Breakdown</h3>
      <ul>
        ${bills.map(b => `<li>${b.name}: $${b.amount.toFixed(2)}</li>`).join('')}
      </ul>
    `;

    generateAdvice(remaining, bills, income);
    generateChart(bills, percentage);

    // Show hidden sections
    summary.classList.remove('hidden');
    breakdown.classList.remove('hidden');
    chartContainer.classList.remove('hidden');
    adviceSection.classList.remove('hidden');
    exportBtn.classList.remove('hidden');
  };

  function generateAdvice(remaining, bills, income) {
    let advice = '';
    if (remaining < 0) {
      advice += `<p>⚠️ You are overspending by <strong>$${Math.abs(remaining).toFixed(2)}</strong>. Consider reducing non-essential bills.</p>`;
    } else if (remaining < income * 0.1) {
      advice += `<p>⚠️ Your savings are low. Aim to save at least 10% of your income.</p>`;
    } else {
      advice += `<p>✅ Great job! You're managing your budget well.</p>`;
    }

    const biggest = bills.sort((a, b) => b.amount - a.amount)[0];
    advice += `<p>Your largest expense is <strong>${biggest.name}</strong> at <strong>$${biggest.amount.toFixed(2)}</strong>.</p>`;

    document.getElementById('adviceSection').innerHTML = `
      <h3>Smart Financial Advice</h3>
      <div class="advice">${advice}</div>
    `;
  }

  function generateChart(bills, usedPercent) {
    const ctx = document.getElementById('budgetChart').getContext('2d');
    if (budgetChart) budgetChart.destroy();

    budgetChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: bills.map(b => b.name),
        datasets: [{
          label: 'Expenses',
          data: bills.map(b => b.amount),
          backgroundColor: [
            '#f94144', '#f3722c', '#f9844a', '#f9c74f',
            '#90be6d', '#43aa8b', '#577590', '#277da1',
            '#4d908e', '#6a4c93', '#b5179e'
          ],
          borderColor: '#fff',
          borderWidth: 2
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

  exportBtn.addEventListener('click', () => {
    const pdf = new window.jspdf.jsPDF();
    pdf.setFontSize(14);
    pdf.text('Budget Report', 20, 20);

    let y = 30;
    const income = document.getElementById('income').value;
    pdf.text(`Income: $${income}`, 20, y);
    y += 10;

    [...document.querySelectorAll('#billList .bill-group')].forEach(group => {
      const name = group.querySelector('select').value;
      const amount = group.querySelector('input').value;
      pdf.text(`${name}: $${amount}`, 20, y);
      y += 10;
    });

    pdf.text(`Remaining: $${(document.getElementById('summary').innerText.match(/Remaining:\s+\$(\d+(\.\d+)?)/) || [])[1]}`, 20, y);
    y += 20;

    const adviceText = document.getElementById('adviceSection').innerText;
    pdf.setFontSize(12);
    pdf.text("Advice:", 20, y);
    y += 10;

    const lines = pdf.splitTextToSize(adviceText, 170);
    pdf.text(lines, 20, y);

    pdf.save("budget_report.pdf");
  });
});
