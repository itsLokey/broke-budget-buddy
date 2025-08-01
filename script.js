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
  const billsContainer = document.getElementById('bills-section');
  const addBillBtn = document.getElementById('addBill');

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

  let selectedBillIds = new Set();

  function createBillRow(selectedId = '', amount = '') {
    const row = document.createElement('div');
    row.className = 'bill';

    const select = document.createElement('select');
    select.className = 'bill-name';
    select.required = true;

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '-- Select bill --';
    select.appendChild(defaultOption);

    predefinedBills.forEach(bill => {
      const option = document.createElement('option');
      option.value = bill.id;
      option.textContent = bill.label;
      if (bill.id === selectedId) option.selected = true;
      select.appendChild(option);
    });

    const amountInput = document.createElement('input');
    amountInput.type = 'number';
    amountInput.min = '0';
    amountInput.step = '0.01';
    amountInput.className = 'bill-amount';
    amountInput.placeholder = 'Amount';
    amountInput.required = true;
    amountInput.value = amount || (selectedId ? getDefaultAmount(selectedId) : '');

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-bill-btn';
    removeBtn.textContent = '×';

    select.addEventListener('change', () => {
      selectedBillIds.delete(selectedId);
      selectedId = select.value;

      if (selectedId) {
        if (selectedBillIds.has(selectedId)) {
          alert('This bill is already selected. Please choose another.');
          select.value = '';
          amountInput.value = '';
          return;
        }
        selectedBillIds.add(selectedId);
      }

      if (!amountInput.value) {
        amountInput.value = getDefaultAmount(selectedId);
      }

      updateBillSelectOptions();
    });

    removeBtn.addEventListener('click', () => {
      if (selectedId) selectedBillIds.delete(selectedId);
      row.remove();
      updateBillSelectOptions();
      toggleAddBillBtn();
    });

    row.appendChild(select);
    row.appendChild(amountInput);
    row.appendChild(removeBtn);

    return row;
  }

  function getDefaultAmount(id) {
    const bill = predefinedBills.find(b => b.id === id);
    return bill ? bill.default : '';
  }

  function updateBillSelectOptions() {
    const selects = billsContainer.querySelectorAll('select.bill-name');
    const currentValues = new Set();

    selects.forEach(select => {
      if (select.value) currentValues.add(select.value);
    });

    selects.forEach(select => {
      const currentVal = select.value;
      [...select.options].forEach(option => {
        if (option.value === '') {
          option.disabled = false;
          return;
        }
        option.disabled = currentValues.has(option.value) && option.value !== currentVal;
      });
    });
  }

  // Disable Add Bill button if all bills are added
  function toggleAddBillBtn() {
    addBillBtn.disabled = selectedBillIds.size >= predefinedBills.length;
  }

  addBillBtn.addEventListener('click', () => {
    if (selectedBillIds.size >= predefinedBills.length) {
      alert('All predefined bills have been added.');
      return;
    }
    const newRow = createBillRow();
    billsContainer.appendChild(newRow);
    updateBillSelectOptions();
    toggleAddBillBtn();
  });

  // Initialize with one bill row
  billsContainer.appendChild(createBillRow());
  toggleAddBillBtn();

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

    const billRows = billsContainer.querySelectorAll('.bill');
    billRows.forEach(row => {
      const select = row.querySelector('select.bill-name');
      const amountInput = row.querySelector('input.bill-amount');

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

    // Show titles & export button
    document.getElementById('summary-title').classList.remove('hidden');
    document.getElementById('chart-title').classList.remove('hidden');
    document.getElementById('advice-title').classList.remove('hidden');
    exportBtn.classList.remove('hidden');
    progressSection.classList.remove('hidden');
    resultsSection.classList.remove('hidden');

    // Display summary
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
      progressBar.style.backgroundColor = '#4caf50'; // green
      progressText.textContent = 'You are under budget. Great job!';
    } else if (percentage >= 60 && percentage <= 90) {
      progressBar.style.backgroundColor = '#ffa500'; // orange
      progressText.textContent = 'Careful — you’re nearing your limit.';
    } else {
      progressBar.style.backgroundColor = '#e53935'; // red
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

  // More detailed and actionable financial advice
  function generateAdvice(remaining, bills, income) {
    let advice = '';

    if (remaining < 0) {
      advice += `<p>⚠️ <strong>You are overspending by $${Math.abs(remaining).toFixed(2)}.</strong> Consider cutting back on non-essential bills or increasing your income.</p>`;
    } else if (remaining === 0) {
      advice += `<p>👍 Your budget is perfectly balanced. Try to save a little if possible for emergencies.</p>`;
    } else {
      advice += `<p>🎉 Great job! You have $${remaining.toFixed(2)} remaining after bills. Consider saving or investing this amount.</p>`;
    }

    // Highlight biggest expense
    if (bills.length > 0) {
      const biggest = bills.reduce((max, b) => b.amount > max.amount ? b : max, bills[0]);
      advice += `<p>Your biggest expense is <strong>${biggest.name}</strong> at $${biggest.amount.toFixed(2)}. Review if there's room to optimize here.</p>`;
    }

    // Savings advice based on spending ratio
    const expenseRatio = (bills.reduce((a, b) => a + b.amount, 0) / income);
    if (expenseRatio > 0.9) {
      advice += `<p>💡 Your expenses are over 90% of your income. Try to reduce discretionary spending to improve financial health.</p>`;
    } else if (expenseRatio > 0.75) {
      advice += `<p>💡 You’re spending a lot of your income. Keep tracking and look for savings.</p>`;
    } else {
      advice += `<p>💡 You have good control over your budget. Keep it up!</p>`;
    }

    return advice;
  }
});
