document.addEventListener('DOMContentLoaded', () => {
  const budgetForm = document.getElementById('budget-form');
  const resultsSection = document.getElementById('results');
  const summaryTitle = document.getElementById('summary-title');
  const chartTitle = document.getElementById('chart-title');
  const adviceTitle = document.getElementById('advice-title');
  const exportBtn = document.getElementById('export-pdf-btn');
  const progressSection = document.getElementById('progress-section');
  const summaryDiv = document.getElementById('summary');
  const adviceDiv = document.getElementById('advice');
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');
  const chartCanvas = document.getElementById('budgetChart');
  const billsContainer = document.getElementById('bills-container');
  const addBillBtn = document.getElementById('add-bill-btn');

  let budgetChart = null;

  const predefinedBills = [
    { id: 'rent', label: 'Rent / Mortgage', default: 1200 },
    { id: 'utilities', label: 'Utilities (Electricity, Water)', default: 150 },
    { id: 'internet', label: 'Internet / Cable', default: 60 },
    { id: 'phone', label: 'Phone', default: 50 },
    { id: 'groceries', label: 'Groceries', default: 400 },
    { id: 'transport', label: 'Transport / Gas / Public Transit', default: 150 },
    { id: 'insurance', label: 'Insurance (Health, Car, Home)', default: 200 },
    { id: 'subscriptions', label: 'Subscriptions (Netflix, Spotify, etc.)', default: 50 },
    { id: 'debt', label: 'Debt Payments (Loans, Credit Cards)', default: 300 },
    { id: 'other', label: 'Other', default: 0 }
  ];

  let addedBillIds = new Set();

  function createBillEntry(selectedId = '', amountVal = '') {
    const div = document.createElement('div');
    div.className = 'bill-entry';

    const select = document.createElement('select');
    select.className = 'bill-select';
    select.required = true;

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '-- Select bill --';
    select.appendChild(defaultOption);

    predefinedBills.forEach(bill => {
      if (!addedBillIds.has(bill.id) || bill.id === selectedId) {
        const option = document.createElement('option');
        option.value = bill.id;
        option.textContent = bill.label;
        if (bill.id === selectedId) option.selected = true;
        select.appendChild(option);
      }
    });

    const input = document.createElement('input');
    input.type = 'number';
    input.min = '0';
    input.step = '0.01';
    input.placeholder = 'Amount';
    input.className = 'bill-amount';
    input.required = true;
    input.value = amountVal || (selectedId ? getDefaultAmount(selectedId) : '');

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-bill-btn';
    removeBtn.textContent = '×';

    select.addEventListener('change', () => {
      if (selectedId) addedBillIds.delete(selectedId);
      selectedId = select.value;

      if (selectedId) addedBillIds.add(selectedId);
      refreshAllBillSelects();

      if (!input.value) input.value = getDefaultAmount(selectedId);
    });

    removeBtn.addEventListener('click', () => {
      if (selectedId) {
        addedBillIds.delete(selectedId);
      }
      div.remove();
      refreshAllBillSelects();
    });

    div.appendChild(select);
    div.appendChild(input);
    div.appendChild(removeBtn);

    return div;
  }

  function getDefaultAmount(id) {
    const bill = predefinedBills.find(b => b.id === id);
    return bill ? bill.default : '';
  }

  function refreshAllBillSelects() {
    const selects = billsContainer.querySelectorAll('select.bill-select');
    selects.forEach(select => {
      const currentValue = select.value;
      [...select.options].forEach(option => {
        if (option.value === '') {
          option.disabled = false;
          return;
        }
        const isSelectedElsewhere = [...selects].some(otherSelect =>
          otherSelect !== select && otherSelect.value === option.value
        );
        option.disabled = isSelectedElsewhere && option.value !== currentValue;
      });
    });
  }

  addBillEntry();

  addBillBtn.addEventListener('click', () => {
    addBillEntry();
  });

  function addBillEntry(selectedId = '', amountVal = '') {
    if (addedBillIds.size >= predefinedBills.length && !selectedId) return;
    if (selectedId) addedBillIds.add(selectedId);

    const billEntry = createBillEntry(selectedId, amountVal);
    billsContainer.appendChild(billEntry);
    refreshAllBillSelects();
  }

  budgetForm.onsubmit = (e) => {
    e.preventDefault();

    const income = parseFloat(document.getElementById('income').value) || 0;
    const partnerIncome = parseFloat(document.getElementById('partnerIncome').value) || 0;
    const totalIncome = income + partnerIncome;

    if (totalIncome <= 0) {
      alert('Please enter a valid total income.');
      return;
    }

    const bills = [];
    let valid = true;

    const billEntries = billsContainer.querySelectorAll('.bill-entry');
    billEntries.forEach(entry => {
      const select = entry.querySelector('select.bill-select');
      const amountInput = entry.querySelector('input.bill-amount');
      if (!select.value) {
        alert('Please select a bill from the dropdown.');
        valid = false;
        return;
      }
      const amount = parseFloat(amountInput.value);
      if (isNaN(amount) || amount < 0) {
        alert('Please enter a valid amount for all bills.');
        valid = false;
        return;
      }
      bills.push({
        id: select.value,
        name: predefinedBills.find(b => b.id === select.value).label,
        amount,
        category: select.value.charAt(0).toUpperCase() + select.value.slice(1)
      });
    });

    if (!valid) return;

    const totalExpenses = bills.reduce((acc, b) => acc + b.amount, 0);
    const remaining = totalIncome - totalExpenses;

    summaryTitle.classList.remove('hidden');
    chartTitle.classList.remove('hidden');
    adviceTitle.classList.remove('hidden');
    exportBtn.classList.remove('hidden');
    progressSection.classList.remove('hidden');

    resultsSection.classList.remove('hidden');

    summaryDiv.innerHTML = `
      <p><strong>Total Income:</strong> $${totalIncome.toFixed(2)}</p>
      <p><strong>Total Expenses:</strong> $${totalExpenses.toFixed(2)}</p>
      <p><strong>Remaining:</strong> $${remaining.toFixed(2)}</p>
    `;

    updateProgressBar(totalIncome, totalExpenses);

    generateChart(bills);

    adviceDiv.innerHTML = generateAdvice(remaining, bills, totalIncome);
  };

  exportBtn.onclick = () => {
    exportBtn.style.display = 'none';
    html2pdf().set({
      margin: 0.5,
      filename: 'BrokeBudgetBuddy_Summary.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, logging: false, dpi: 192, letterRendering: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    }).from(resultsSection).save()
      .finally(() => {
        exportBtn.style.display = 'inline-block';
      });
  };

  function updateProgressBar(income, expenses) {
    let percentage = (expenses / income) * 100;
    percentage = Math.min(percentage, 150);
    progressBar.style.width = percentage + '%';

    if (percentage < 60) {
      progressBar.style.backgroundColor = '#4caf50';
      progressText.textContent = 'You are under budget. Great job!';
    } else if (percentage >= 60 && percentage <= 90) {
      progressBar.style.backgroundColor = '#ffa500';
      progressText.textContent = 'Careful — you’re nearing your limit.';
    } else {
      progressBar.style.backgroundColor = '#e53935';
      progressText.textContent = 'You are over budget!';
    }
  }

  function generateChart(bills) {
    const labels = bills.map(b => b.name);
    const data = bills.map(b => b.amount);

    if (budgetChart && typeof budgetChart.destroy === 'function') {
      budgetChart.destroy();
    }

    budgetChart = new Chart(chartCanvas, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          label: 'Spending Breakdown',
          data,
          backgroundColor: [
            '#2a7de1', '#4caf50', '#ff9800', '#9c27b0', '#e91e63',
            '#009688', '#f44336', '#3f51b5', '#00bcd4', '#ffc107'
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

  // --- UPDATED generateAdvice function ---
  function generateAdvice(remaining, bills, income) {
    let advice = '';

    if (remaining < 0) {
      advice += `<p>⚠️ <strong>You are overspending by $${Math.abs(remaining).toFixed(2)}.</strong> Consider these steps:</p>`;
      advice += `<ul>
        <li>Review and cut non-essential expenses (e.g., subscriptions, dining out).</li>
        <li>Prioritize debt repayments with the highest interest rates.</li>
        <li>Look for ways to increase your income through side gigs or negotiating raises.</li>
        <li>Consider creating a stricter budget plan and tracking your spending daily.</li>
      </ul>`;
    } else if (remaining < income * 0.1) {
      advice += `<p>⚠️ You have limited savings potential. Here's what you can do:</p>`;
      advice += `<ul>
        <li>Track every expense carefully to identify small savings opportunities.</li>
        <li>Set up automatic transfers to a savings account, even if small.</li>
        <li>Reduce discretionary spending, like entertainment or dining out.</li>
        <li>Build an emergency fund starting with at least $500.</li>
      </ul>`;
    } else {
      advice += `<p>✅ You have a healthy buffer of $${remaining.toFixed(2)}. Consider these smart moves:</p>`;
      advice += `<ul>
        <li>Start or increase contributions to an emergency fund (3-6 months of expenses).</li>
        <li>Consider investing in retirement accounts or other investment vehicles.</li>
        <li>Set short- and long-term financial goals (vacation, home, education).</li>
        <li>Continue to monitor your spending and adjust budget as needed.</li>
      </ul>`;
    }

    const totalExpenses = bills.reduce((acc, b) => acc + b.amount, 0);
    const categoryTotals = {};
    bills.forEach(b => {
      categoryTotals[b.category] = (categoryTotals[b.category] || 0) + b.amount;
    });

    for (const [cat, amt] of Object.entries(categoryTotals)) {
      if (amt > totalExpenses * 0.4) {
        advice += `<p>👉 Notice that <strong>${cat}</strong> accounts for over 40% of your spending. Consider:</p>`;
        if (cat.toLowerCase().includes('rent')) {
          advice += `<ul><li>Exploring cheaper housing options or negotiating rent.</li></ul>`;
        } else if (cat.toLowerCase().includes('debt')) {
          advice += `<ul><li>Reviewing your debt repayment plan and possibly consolidating high-interest debts.</li></ul>`;
        } else if (cat.toLowerCase().includes('subscriptions')) {
          advice += `<ul><li>Canceling unused or less important subscriptions.</li></ul>`;
        } else if (cat.toLowerCase().includes('groceries')) {
          advice += `<ul><li>Planning meals and using discounts/coupons to reduce grocery bills.</li></ul>`;
        } else {
          advice += `<ul><li>Reviewing this category to find possible savings.</li></ul>`;
        }
      }
    }

    advice += `<p><em>Disclaimer: This advice is generated to help you plan better but does not replace professional financial consulting.</em></p>`;
    return advice;
  }
});
