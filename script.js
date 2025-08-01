document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('budget-form');
  const resultsSection = document.getElementById('results');
  const summaryDiv = document.getElementById('summary');
  const adviceDiv = document.getElementById('advice');
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');
  const chartCtx = document.getElementById('budgetChart').getContext('2d');
  const exportBtn = document.getElementById('export-pdf-btn');

  const billSelect = document.getElementById('bill-select');
  const billAmountInput = document.getElementById('bill-amount');
  const addBillBtn = document.getElementById('add-bill-btn');
  const billsList = document.getElementById('bills-list');

  // Array to keep track of added bills
  let bills = [];

  // Chart.js instance
  let budgetChart = null;

  // Pre-fill amount input when user selects a bill
  billSelect.addEventListener('change', () => {
    const selectedOption = billSelect.options[billSelect.selectedIndex];
    billAmountInput.value = selectedOption.dataset.default || '';
    billAmountInput.focus();
  });

  // Add bill button
  addBillBtn.addEventListener('click', () => {
    const billName = billSelect.value;
    const billAmount = parseFloat(billAmountInput.value);

    if (!billName) {
      alert('Please select a bill.');
      return;
    }
    if (isNaN(billAmount) || billAmount < 0) {
      alert('Please enter a valid amount.');
      return;
    }
    // Prevent duplicate bills
    if (bills.some(b => b.name === billName)) {
      alert('This bill is already added.');
      return;
    }

    bills.push({ name: billName, amount: billAmount });
    renderBillsList();

    // Reset inputs
    billSelect.value = '';
    billAmountInput.value = '';
  });

  // Render bills list with remove buttons
  function renderBillsList() {
    billsList.innerHTML = '';
    bills.forEach((bill, index) => {
      const li = document.createElement('li');
      li.textContent = `${bill.name}: $${bill.amount.toFixed(2)}`;

      const removeBtn = document.createElement('button');
      removeBtn.textContent = 'Remove';
      removeBtn.classList.add('remove-btn');
      removeBtn.addEventListener('click', () => {
        bills.splice(index, 1);
        renderBillsList();
      });

      li.appendChild(removeBtn);
      billsList.appendChild(li);
    });
  }

  // Calculate and display budget when form submits
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const income = parseFloat(document.getElementById('income').value) || 0;
    const partnerIncome = parseFloat(document.getElementById('partnerIncome').value) || 0;
    const totalIncome = income + partnerIncome;

    if (totalIncome <= 0) {
      alert('Please enter a valid income.');
      return;
    }

    if (bills.length === 0) {
      alert('Please add at least one bill.');
      return;
    }

    const totalExpenses = bills.reduce((acc, b) => acc + b.amount, 0);
    const remaining = totalIncome - totalExpenses;

    resultsSection.classList.remove('hidden');

    summaryDiv.innerHTML = `
      <p><strong>Total Income:</strong> $${totalIncome.toFixed(2)}</p>
      <p><strong>Total Expenses:</strong> $${totalExpenses.toFixed(2)}</p>
      <p><strong>Remaining:</strong> $${remaining.toFixed(2)}</p>
    `;

    updateProgressBar(totalIncome, totalExpenses);
    drawChart(bills);
    adviceDiv.innerHTML = generateAdvice(remaining, bills, totalIncome);
  });

  // Export PDF button
  exportBtn.addEventListener('click', () => {
    const element = resultsSection;

    exportBtn.style.display = 'none'; // hide button during export

    html2pdf().set({
      margin: 0.5,
      filename: 'BrokeBudgetBuddy_Summary.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, logging: false, dpi: 192, letterRendering: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    }).from(element).save()
    .finally(() => {
      exportBtn.style.display = 'inline-block'; // show button again
    });
  });

  // Progress bar update
  function updateProgressBar(income, expenses) {
    const percentage = Math.min((expenses / income) * 100, 150);
    progressBar.style.width = percentage + '%';

    if (percentage < 70) {
      progressBar.style.backgroundColor = '#4CAF50'; // green
      progressText.textContent = 'You are under budget. Great job!';
    } else if (percentage >= 70 && percentage <= 100) {
      progressBar.style.backgroundColor = '#FFA500'; // orange
      progressText.textContent = 'Careful — you’re nearing your limit.';
    } else {
      progressBar.style.backgroundColor = '#E53935'; // red
      progressText.textContent = 'You are over budget!';
    }
  }

  // Chart drawing
  function drawChart(bills) {
    const labels = bills.map(b => b.name);
    const data = bills.map(b => b.amount);

    if (budgetChart) {
      budgetChart.destroy();
    }

    budgetChart = new Chart(chartCtx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          label: 'Spending Breakdown',
          data,
          backgroundColor: [
            '#2a7de1',
            '#4caf50',
            '#ff9800',
            '#9c27b0',
            '#e91e63',
            '#009688',
            '#f44336',
            '#3f51b5',
            '#00bcd4',
            '#ffc107'
          ]
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

  // Advice generation
  function generateAdvice(remaining, bills, income) {
    let advice = '';

    if (remaining < 0) {
      advice += `<p>⚠️ <strong>You are overspending by $${Math.abs(remaining).toFixed(2)}.</strong> Consider reducing non-essential expenses or increasing income.</p>`;
    } else if (remaining < income * 0.1) {
      advice += `<p>⚠️ You have limited savings potential. Look for ways to trim expenses and save more.</p>`;
    } else {
      advice += `<p>✅ You have a healthy buffer of $${remaining.toFixed(2)}. Consider saving or investing this amount monthly.</p>`;
    }

    const totalExpenses = bills.reduce((acc, b) => acc + b.amount, 0);
    const categoryTotals = {};
    bills.forEach(b => {
      // Extract first word or full string as category (you can customize)
      const cat = b.name.split(' ')[0];
      categoryTotals[cat] = (categoryTotals[cat] || 0) + b.amount;
    });

    for (const [cat, amt] of Object.entries(categoryTotals)) {
      if (amt > totalExpenses * 0.4) {
        advice += `<p>👉 Notice that <strong>${cat}</strong> accounts for
