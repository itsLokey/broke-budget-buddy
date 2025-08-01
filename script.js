document.addEventListener('DOMContentLoaded', () => {
  const budgetForm = document.getElementById('budget-form');
  const resultsSection = document.getElementById('results');
  const summaryTitle = document.getElementById('summary-title');
  const chartTitle = document.getElementById('chart-title');
  const adviceTitle = document.getElementById('advice-title');
  const exportPdfBtn = document.getElementById('export-pdf-btn');
  const exportCsvBtn = document.getElementById('export-csv-btn');
  const progressSection = document.getElementById('progress-section');
  const summaryDiv = document.getElementById('summary');
  const adviceDiv = document.getElementById('advice');
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');
  const chartCanvas = document.getElementById('budgetChart');
  const billsContainer = document.getElementById('bills-container');
  const addBillBtn = document.getElementById('add-bill-btn');
  const darkModeToggle = document.getElementById('dark-mode-toggle');

  const incomeInput = document.getElementById('income');
  const partnerIncomeInput = document.getElementById('partnerIncome');
  const incomeError = document.getElementById('income-error');
  const partnerIncomeError = document.getElementById('partnerIncome-error');

  let budgetChart = null;

  // Predetermined bills list for dropdown
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

  // Load saved data from localStorage
  function loadSavedData() {
    try {
      const savedIncome = localStorage.getItem('bbb_income');
      if (savedIncome !== null) incomeInput.value = savedIncome;

      const savedPartnerIncome = localStorage.getItem('bbb_partnerIncome');
      if (savedPartnerIncome !== null) partnerIncomeInput.value = savedPartnerIncome;

      const savedBills = JSON.parse(localStorage.getItem('bbb_bills'));
      if (savedBills && Array.isArray(savedBills)) {
        savedBills.forEach(bill => addBillEntry(bill.id, bill.amount));
      } else {
        addBillEntry(); // Add one blank entry if none saved
      }

      // Dark mode
      const darkModePref = localStorage.getItem('bbb_darkMode');
      if (darkModePref === 'true') {
        document.body.classList.add('dark-mode');
        darkModeToggle.checked = true;
      }
    } catch (e) {
      console.error('Error loading saved data', e);
      addBillEntry();
    }
  }

  // Save current data to localStorage
  function saveData() {
    try {
      localStorage.setItem('bbb_income', incomeInput.value);
      localStorage.setItem('bbb_partnerIncome', partnerIncomeInput.value);

      const billsData = [];
      billsContainer.querySelectorAll('.bill-entry').forEach(entry => {
        const select = entry.querySelector('select.bill-select');
        const amountInput = entry.querySelector('input.bill-amount');
        if (select.value) {
          billsData.push({ id: select.value, amount: amountInput.value });
        }
      });
      localStorage.setItem('bbb_bills', JSON.stringify(billsData));

      localStorage.setItem('bbb_darkMode', darkModeToggle.checked ? 'true' : 'false');
    } catch (e) {
      console.error('Error saving data', e);
    }
  }

  // Create a bill entry DOM element
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
      saveData();
    });

    input.addEventListener('input', () => {
      saveData();
    });

    removeBtn.addEventListener('click', () => {
      if (selectedId) {
        addedBillIds.delete(selectedId);
      }
      div.remove();
      refreshAllBillSelects();
      saveData();
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

  function addBillEntry(selectedId = '', amountVal = '') {
    if (addedBillIds.size >= predefinedBills.length && !selectedId) return;
    if (selectedId) addedBillIds.add(selectedId);

    const billEntry = createBillEntry(selectedId, amountVal);
    billsContainer.appendChild(billEntry);
    refreshAllBillSelects();
  }

  // Inline validation helpers
  function clearErrors() {
    incomeError.textContent = '';
    partnerIncomeError.textContent = '';
    billsContainer.querySelectorAll('.bill-entry').forEach(entry => {
      const select = entry.querySelector('select.bill-select');
      const amount = entry.querySelector('input.bill-amount');
      select.style.borderColor = '';
      amount.style.borderColor = '';
    });
  }

  function showError(input, message) {
    input.style.borderColor = '#e53935';
    const errorElem = input.nextElementSibling;
    if (errorElem && errorElem.classList.contains('error-message')) {
      errorElem.textContent = message;
    }
  }

  function validateForm() {
    clearErrors();
    let valid = true;

    if (!incomeInput.value || isNaN(incomeInput.value) || parseFloat(incomeInput.value) <= 0) {
      showError(incomeInput, 'Please enter a valid income greater than 0.');
      valid = false;
    }

    if (partnerIncomeInput.value && (isNaN(partnerIncomeInput.value) || parseFloat(partnerIncomeInput.value) < 0)) {
      showError(partnerIncomeInput, 'Please enter a valid partner income or leave blank.');
      valid = false;
    }

    const billEntries = billsContainer.querySelectorAll('.bill-entry');
    billEntries.forEach(entry => {
      const select = entry.querySelector('select.bill-select');
      const amountInput = entry.querySelector('input.bill-amount');

      if (!select.value) {
        select.style.borderColor = '#e53935';
        valid = false;
      }
      if (!amountInput.value || isNaN(amountInput.value) || parseFloat(amountInput.value) < 0) {
        amountInput.style.borderColor = '#e53935';
        valid = false;
      }
    });

    return valid;
  }

  budgetForm.onsubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const income = parseFloat(incomeInput.value) || 0;
    const partnerIncome = parseFloat(partnerIncomeInput.value) || 0;
    const totalIncome = income + partnerIncome;

    const bills = [];
    const billEntries = billsContainer.querySelectorAll('.bill-entry');
    billEntries.forEach(entry => {
      const select = entry.querySelector('select.bill-select');
      const amountInput = entry.querySelector('input.bill-amount');
      bills.push({
        id: select.value,
        name: predefinedBills.find(b => b.id === select.value).label,
        amount: parseFloat(amountInput.value),
        category: select.value.charAt(0).toUpperCase() + select.value.slice(1)
      });
    });

    const totalExpenses = bills.reduce((acc, b) => acc + b.amount, 0);
    const remaining = totalIncome - totalExpenses;

    summaryTitle.classList.remove('hidden');
    chartTitle.classList.remove('hidden');
    adviceTitle.classList.remove('hidden');
    exportPdfBtn.classList.remove('hidden');
    exportCsvBtn.classList.remove('hidden');
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

    saveData();
  };

  // Export PDF
  exportPdfBtn.onclick = () => {
    exportPdfBtn.style.display = 'none';
    exportCsvBtn.style.display = 'none';

    html2pdf().set({
      margin: 0.5,
      filename: 'BrokeBudgetBuddy_Summary.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, logging: false, dpi: 192, letterRendering: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    }).from(resultsSection).save()
      .finally(() => {
        exportPdfBtn.style.display = 'inline-block';
        exportCsvBtn.style.display = 'inline-block';
      });
  };

  // Export CSV
  exportCsvBtn.onclick = () => {
    const income = parseFloat(incomeInput.value) || 0;
    const partnerIncome = parseFloat(partnerIncomeInput.value) || 0;
    const totalIncome = income + partnerIncome;

    const bills = [];
    billsContainer.querySelectorAll('.bill-entry').forEach(entry => {
      const select = entry.querySelector('select.bill-select');
      const amountInput = entry.querySelector('input.bill-amount');
      if (select.value) {
        bills.push({
          name: predefinedBills.find(b => b.id === select.value).label,
          amount: parseFloat(amountInput.value)
        });
      }
    });

    const totalExpenses = bills.reduce((acc, b) => acc + b.amount, 0);
    const remaining = totalIncome - totalExpenses;

    let csvContent = `Budget Summary\n`;
    csvContent += `Total Income,$${totalIncome.toFixed(2)}\n`;
    csvContent += `Total Expenses,$${totalExpenses.toFixed(2)}\n`;
    csvContent += `Remaining,$${remaining.toFixed(2)}\n\n`;

    csvContent += `Bills Breakdown\nName,Amount\n`;
    bills.forEach(bill => {
      csvContent += `${bill.name},$${bill.amount.toFixed(2)}\n`;
    });

    // Create a Blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'BrokeBudgetBuddy_Summary.csv';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

  function generateAdvice(remaining, bills, income) {
    let advice = '';

    if (remaining < 0) {
      advice += `<p>⚠️ <strong>You are overspending by $${Math.abs(remaining).toFixed(2)}.</strong> Consider reducing non-essential expenses or increasing your income.</p>`;
      advice += `<ul>
        <li>Review subscriptions and memberships; cancel unused ones.</li>
        <li>Look for cheaper alternatives on utilities or phone plans.</li>
        <li>Create a debt repayment plan to reduce interest payments.</li>
        <li>Consider increasing income streams if possible.</li>
      </ul>`;
    } else if (remaining < income * 0.1) {
      advice += `<p>⚠️ You have limited savings potential. Look for ways to trim expenses and save more.</p>`;
      advice += `<ul>
        <li>Track spending closely for small unnecessary purchases.</li>
        <li>Cook at home instead of eating out to save money.</li>
        <li>Set a monthly savings goal and automate transfers.</li>
        <li>Check for better deals on recurring bills.</li>
      </ul>`;
    } else {
      advice += `<p>✅ You have a healthy buffer of $${remaining.toFixed(2)}. Consider saving or investing this amount monthly.</p>`;
      advice += `<ul>
        <li>Build an emergency fund covering 3-6 months of expenses.</li>
        <li>Look into low-risk investment options for steady growth.</li>
        <li>Plan for future goals like homeownership or retirement.</li>
        <li>Continue tracking spending to maintain healthy finances.</li>
      </ul>`;
    }

    const totalExpenses = bills.reduce((acc, b) => acc + b.amount, 0);
    const categoryTotals = {};
    bills.forEach(b => {
      categoryTotals[b.category] = (categoryTotals[b.category] || 0) + b.amount;
    });

    for (const [cat, amt] of Object.entries(categoryTotals)) {
      if (amt > totalExpenses * 0.4) {
        advice += `<p>👉 Notice that <strong>${cat}</strong> accounts for over 40% of your spending. You might want to review this expense.</p>`;
      }
    }

    advice += `<p><em>Disclaimer: This advice is generated to help you plan better but does not replace professional financial consulting.</em></p>`;
    return advice;
  }

  // Dark mode toggle logic
  darkModeToggle.addEventListener('change', () => {
    if (darkModeToggle.checked) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    saveData();
  });

  // Add bill button listener
  addBillBtn.addEventListener('click', () => {
    addBillEntry();
    saveData();
  });

  // On income or partner income input, save data immediately
  incomeInput.addEventListener('input', saveData);
  partnerIncomeInput.addEventListener('input', saveData);

  // Initialize
  loadSavedData();
});
