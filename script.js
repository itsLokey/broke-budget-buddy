document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('budget-form');
  const billsSection = document.getElementById('bills-section');
  const addBillBtn = document.getElementById('addBill');
  const resultSection = document.getElementById('results');
  const summary = document.getElementById('summary');
  const breakdown = document.getElementById('breakdown');
  const advice = document.getElementById('advice');
  const exportPDFBtn = document.getElementById('exportPDF');

  let chart = null;

  function createBillRow() {
    const billDiv = document.createElement('div');
    billDiv.className = 'bill';

    const select = document.createElement('select');
    select.className = 'bill-name';
    const options = ["Rent", "Groceries", "Utilities", "Internet", "Phone", "Insurance", "Transportation", "Childcare", "Debt Repayment"];
    options.forEach(opt => {
      const o = document.createElement('option');
      o.value = opt;
      o.text = opt;
      select.appendChild(o);
    });

    const input = document.createElement('input');
    input.type = 'number';
    input.className = 'bill-amount';
    input.placeholder = 'Amount';

    billDiv.appendChild(select);
    billDiv.appendChild(input);

    billsSection.appendChild(billDiv);
  }

  addBillBtn.addEventListener('click', createBillRow);

  form.onsubmit = (e) => {
    e.preventDefault();

    const income = parseFloat(document.getElementById('income').value) || 0;
    const partnerIncome = parseFloat(document.getElementById('partnerIncome').value) || 0;
    const totalIncome = income + partnerIncome;

    const billNames = Array.from(document.querySelectorAll('.bill-name')).map(el => el.value);
    const billAmounts = Array.from(document.querySelectorAll('.bill-amount')).map(el => parseFloat(el.value) || 0);

    const bills = billNames.map((name, i) => ({ name, amount: billAmounts[i] }));
    const totalExpenses = bills.reduce((acc, bill) => acc + bill.amount, 0);
    const remaining = totalIncome - totalExpenses;

    summary.innerHTML = `
      <p><strong>Total Income:</strong> $${totalIncome.toFixed(2)}</p>
      <p><strong>Total Expenses:</strong> $${totalExpenses.toFixed(2)}</p>
      <p><strong>Remaining Balance:</strong> $${remaining.toFixed(2)}</p>
    `;

    breakdown.innerHTML = bills.map(bill => `<p>${bill.name}: $${bill.amount.toFixed(2)}</p>`).join('');

    generateAdvice(remaining, totalIncome, bills);
    generateChart(bills);

    resultSection.classList.remove('hidden');
  };

  function generateAdvice(remaining, income, bills) {
    let message = '';

    const essentials = ["Rent", "Groceries", "Utilities"];
    const essentialsTotal = bills.filter(b => essentials.includes(b.name)).reduce((a, b) => a + b.amount, 0);
    const essentialRatio = (essentialsTotal / income) * 100;

    if (remaining < 0) {
      message += `<p>⚠️ You're overspending by $${Math.abs(remaining).toFixed(2)}. Consider cutting back.</p>`;
    } else if (remaining < income * 0.1) {
      message += `<p>💡 You’re cutting it close. Consider building an emergency fund.</p>`;
    } else {
      message += `<p>✅ Great job! You have a buffer of $${remaining.toFixed(2)} this month.</p>`;
    }

    if (essentialRatio > 50) {
      message += `<p>📊 Essentials take up ${essentialRatio.toFixed(1)}% of your income. Try to keep this under 50%.</p>`;
    }

    if (income > 0 && bills.some(b => b.name === "Debt Repayment")) {
      message += `<p>💸 Make sure debt repayments don’t exceed 20% of your income for long-term health.</p>`;
    }

    message += `<p>📈 Tip: Allocate at least 10% of your income to savings if possible.</p>`;

    advice.innerHTML = message;
  }

  function generateChart(bills) {
    const ctx = document.getElementById('budgetChart').getContext('2d');

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: bills.map(b => b.name),
        datasets: [{
          data: bills.map(b => b.amount),
          backgroundColor: [
            '#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c',
            '#34495e', '#e67e22', '#95a5a6'
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

  exportPDFBtn.addEventListener('click', () => {
    import('jspdf').then(jsPDFModule => {
      const doc = new jsPDFModule.jsPDF();
      doc.setFontSize(16);
      doc.text("Broke Budget Buddy Report", 20, 20);

      doc.setFontSize(12);
      doc.text(summary.textContent, 20, 40);
      doc.text(breakdown.textContent, 20, 60);
      doc.text(advice.textContent, 20, 100);

      doc.save("budget-summary.pdf");
    });
  });
});
