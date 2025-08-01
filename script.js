document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('budget-form');
  const resultsSection = document.getElementById('results');
  const summaryDiv = document.getElementById('summary');
  const adviceDiv = document.getElementById('advice');
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');
  const chartCtx = document.getElementById('budgetChart').getContext('2d');
  const exportBtn = document.getElementById('export-pdf-btn');

  // Keep track of Chart.js chart instance
  let budgetChart = null;

  // Enable/disable amount inputs based on checkbox
  const billCheckboxes = document.querySelectorAll('input[type="checkbox"][id^="bill-"]');
  billCheckboxes.forEach(box => {
    box.addEventListener('change', () => {
      const amountInput = document.getElementById('amount-' + box.id.replace('bill-', ''));
      if (box.checked) {
        amountInput.disabled = false;
        // Pre-fill with default if empty
        if (!amountInput.value) amountInput.value = box.dataset.default;
      } else {
        amountInput.disabled = true;
        amountInput.value = '';
      }
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const income = parseFloat(document.getElementById('income').value) || 0;
    const partnerIncome = parseFloat(document.getElementById('partnerIncome').value) || 0;
    const totalIncome = income + partnerIncome;

    if (totalIncome <= 0) {
      alert("Please enter a valid income.");
      return;
    }

    let bills = [];
    billCheckboxes.forEach(box => {
      if (box.checked) {
        const id = box.id.replace('bill-', '');
        const amountInput = document.getElementById('amount-' + id);
        let amount = parseFloat(amountInput.value);
        if (isNaN(amount) || amount < 0) amount = 0;

        bills.push({
          name: box.nextElementSibling.textContent,
          amount,
          category: id.charAt(0).toUpperCase() + id.slice(1) // Simple category from id
        });
      }
    });

    // Calculate total expenses
    const totalExpenses = bills.reduce((acc, b) => acc + b.amount, 0);
    const remaining = totalIncome - totalExpenses;

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
    drawChart(bills);

    // Generate advice
    adviceDiv.innerHTML = generateAdvice(remaining, bills, totalIncome);
  });

  exportBtn.addEventListener('click', () => {
    const element = resultsSection;
    // Remove buttons temporarily to clean PDF
    exportBtn.style.display = 'none';

    html2pdf().set({
      margin: 0.5,
      filename: 'BrokeBudgetBuddy_Summary.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, logging: false, dpi: 192, letterRendering: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    }).from(element).save()
    .finally(() => {
      exportBtn.style.display = 'inline-block';
    });
  });

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

  function generateAdvice(remaining, bills, income) {
    let advice = '';

    if (remaining < 0) {
      advice += `<p>⚠️ <strong>You are overspending by $${Math.abs(remaining).toFixed(2)}.</strong> Consider reducing non-essential expenses or increasing income.</p>`;
    } else if (remaining < income * 0.1) {
      advice += `<p>⚠️ You have limited savings potential. Look for ways to trim expenses and save more.</p>`;
    } else {
      advice += `<p>✅ You have a healthy buffer of $${remaining.toFixed(2)}. Consider saving or investing this amount monthly.</p>`;
    }

    // Highlight any category taking too big a chunk (>40% of expenses)
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
});
