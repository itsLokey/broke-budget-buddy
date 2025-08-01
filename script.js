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

  // To keep track of which bills have been added to avoid duplicates
  let addedBillIds = new Set();

  // Helper: create a bill entry DOM element
  function createBillEntry(selectedId = '', amountVal = '') {
    const div = document.createElement('div');
    div.className = 'bill-entry';

    // Create dropdown/select
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

    // Create amount input
    const input = document.createElement('input');
    input.type = 'number';
    input.min = '0';
    input.step = '0.01';
    input.placeholder = 'Amount';
    input.className = 'bill-amount';
    input.required = true;
    input.value = amountVal || (selectedId ? getDefaultAmount(selectedId) : '');

    // Remove button
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-bill-btn';
    removeBtn.textContent = '×';

    // Event listeners
    select.addEventListener('change', () => {
      // Update addedBillIds and refresh other selects
      if (selectedId) addedBillIds.delete(selectedId);
      selectedId = select.value;

      if (selectedId) addedBillIds.add(selectedId);
      refreshAllBillSelects();
      // Reset amount if empty
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

  // Get default amount for bill id
  function getDefaultAmount(id) {
    const bill = predefinedBills.find(b => b.id === id);
    return bill ? bill.default : '';
  }

  // Refresh all dropdowns to disable options already selected elsewhere
  function refreshAllBillSelects() {
    const selects = billsContainer.querySelectorAll('select.bill-select');
    selects.forEach(select => {
      const currentValue = select.value;
      [...select.options].forEach(option => {
        if (option.value === '') {
          option.disabled = false;
          return;
        }
        // Disable option if selected in other dropdowns and not current select's value
        const isSelectedElsewhere = [...selects].some(otherSelect => 
          otherSelect !== select && otherSelect.value === option.value
        );
        option.disabled = isSelectedElsewhere && option.value !== currentValue;
      });
    });
  }

  // Add initial bill entry on load
  addBillEntry();

  // Add bill entry on button click
  addBillBtn.addEventListener('click', () => {
    addBillEntry();
  });

  function addBillEntry(selectedId = '', amountVal = '') {
    // If no bills left to add, do nothing
    if (addedBillIds.size >= predefinedBills.length && !selectedId) return;

    // If selectedId given, add to addedBillIds
    if (selectedId) addedBillIds.add(selectedId);

    const billEntry = createBillEntry(selectedId, amountVal);
    billsContainer.appendChild(billEntry);
    refreshAllBillSelects();
  }

  // Form submission handler
  budgetForm.onsubmit = (e) => {
    e.preventDefault();

    // Get income values
    const income = parseFloat(document.getElementById('income').value) || 0;
    const partnerIncome = parseFloat(document.getElementById('partnerIncome').value) || 0;
    const totalIncome = income + partnerIncome;

    if (totalIncome <= 0) {
      alert('Please enter a valid total income.');
      return;
    }

    // Gather bills
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

    // Calculate totals
    const totalExpenses = bills.reduce((acc, b) => acc + b.amount, 0);
    const remaining = totalIncome - totalExpenses;

    // Show result titles and export button
    summaryTitle.classList.remove('hidden');
    chartTitle.classList.remove('hidden');
    adviceTitle.classList.remove('hidden');
    exportBtn.classList.remove('hidden');
    progressSection.classList.remove('hidden');

    // Show results section
    resultsSection.classList.remove('hidden');

    // Display summary
    summaryDiv.innerHTML = `
      <p><strong>Total Income:</strong> $${totalIncome.toFixed(2)}</p>
      <p><strong>Total Expenses:</strong> $${totalExpenses.toFixed(2)}</p>
      <p><strong>Remaining:</strong> $${remaining.toFixed(2)}</p>
    `;

    // Update progress bar
    updateProgressBar(totalIncome, totalExpenses);

    // Draw chart
    generateChart(bills);

    // Generate advice
    adviceDiv.innerHTML = generateAdvice(remaining, bills, totalIncome);
  };

  // Export PDF
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

  // Progress bar logic
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

  // Chart drawing logic
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

  // Smart advice generation
  function generateAdvice(remaining, bills, income) {
    let advice = '';

    if (remaining < 0) {
      advice += `<p>⚠️ <strong>You are overspending by $${Math
