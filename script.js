document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('budget-form');
  const results = document.getElementById('budget-results');
  const summary = document.getElementById('summary');
  const tips = document.getElementById('tips');
  const addBillBtn = document.getElementById('add-bill');
  const billsContainer = document.getElementById('bills-container');
  const exportBtn = document.getElementById('export-pdf');

  addBillBtn.onclick = () => {
    const billGroup = document.createElement('div');
    billGroup.classList.add('bill-group');
    billGroup.innerHTML = `
      <input type="text" placeholder="e.g. Internet" class="bill-name" required />
      <select class="bill-tag">
        <option value="Rent">Rent</option>
        <option value="Utilities">Utilities</option>
        <option value="Food">Food</option>
        <option value="Transport">Transport</option>
        <option value="Other">Other</option>
      </select>
      <input type="number" placeholder="Amount" class="bill-amount" required />
      <button type="button" class="remove-bill">✕</button>
    `;
    billsContainer.appendChild(billGroup);

    billGroup.querySelector('.remove-bill').onclick = () => {
      billsContainer.removeChild(billGroup);
    };
  };

  form.onsubmit = (e) => {
    e.preventDefault();

    const income = parseFloat(document.getElementById('income').value || 0);
    const partnerIncome = parseFloat(document.getElementById('partnerIncome').value || 0);
    const totalIncome = income + partnerIncome;

    const billNames = document.querySelectorAll('.bill-name');
    const billTags = document.querySelectorAll('.bill-tag');
    const billAmounts = document.querySelectorAll('.bill-amount');

    let totalExpenses = 0;
    let categories = {};
    summary.innerHTML = "";

    for (let i = 0; i < billNames.length; i++) {
      const name = billNames[i].value || `Bill ${i + 1}`;
      const tag = billTags[i].value || 'Other';
      const amount = parseFloat(billAmounts[i].value || 0);

      if (!categories[tag]) categories[tag] = 0;
      categories[tag] += amount;
      totalExpenses += amount;

      const div = document.createElement('div');
      div.textContent = `${name} (${tag}): $${amount.toFixed(2)}`;
      summary.appendChild(div);
    }

    const remaining = totalIncome - totalExpenses;
    summary.innerHTML += `<hr><strong>Total Income:</strong> $${totalIncome.toFixed(2)}<br>`;
    summary.innerHTML += `<strong>Total Expenses:</strong> $${totalExpenses.toFixed(2)}<br>`;
    summary.innerHTML += `<strong>Remaining:</strong> $${remaining.toFixed(2)}<br>`;

    // Advice
    tips.innerHTML = generateAdvice(remaining, categories);
    results.classList.remove('hidden');
  };

  exportBtn.onclick = () => {
    const element = document.getElementById('budget-results');
    html2pdf().set({
      margin: 0.5,
      filename: 'broke-budget-summary.pdf',
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    }).from(element).save();
  };
});

function generateAdvice(remaining, categories) {
  let advice = "";

  if (remaining < 0) {
    advice += "⚠️ You're overspending. Consider cutting from non-essential categories like entertainment or transport.<br>";
  } else if (remaining < 100) {
    advice += "⚠️ You're just breaking even. Try to increase income or set a tighter grocery/utilities budget.<br>";
  } else {
    advice += "✅ You're saving! Consider allocating a portion to emergency savings or debt repayment.<br>";
  }

  for (let [cat, amt] of Object.entries(categories)) {
    if (amt > 0.4 * (remaining + amt)) {
      advice += `👉 You’re spending heavily on <strong>${cat}</strong>. See if you can reduce it.<br>`;
    }
  }

  advice += "<br><em>This advice is AI-generated and not a substitute for professional financial consulting.</em>";
  return advice;
}
