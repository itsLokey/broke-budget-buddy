document.addEventListener("DOMContentLoaded", () => {
  const budgetForm = document.getElementById("budgetForm");
  const billsContainer = document.getElementById("billsContainer");
  const addBillBtn = document.getElementById("addBill");
  const incomeInput = document.getElementById("income");
  const spouseIncomeInput = document.getElementById("spouseIncome");
  const resultsSection = document.getElementById("results");
  const summaryText = document.getElementById("summaryText");
  const usageBar = document.getElementById("usageBar");
  const usageText = document.getElementById("usageText");
  const chartCanvas = document.getElementById("chart");
  const adviceBox = document.getElementById("adviceBox");
  const exportBtn = document.getElementById("exportBtn");

  const billTypes = [
    "Rent", "Utilities", "Groceries", "Insurance",
    "Transportation", "Phone", "Internet", "Debt", "Entertainment", "Savings"
  ];

  let availableBills = [...billTypes];
  let budgetChart;

  function createBillField(name = "", amount = "") {
    const wrapper = document.createElement("div");
    wrapper.className = "bill-entry";

    const select = document.createElement("select");
    billTypes.forEach(type => {
      const option = document.createElement("option");
      option.value = type;
      option.textContent = type;
      if (!availableBills.includes(type) && type !== name) return;
      select.appendChild(option);
    });
    if (name) select.value = name;

    const input = document.createElement("input");
    input.type = "number";
    input.min = "0";
    input.step = "0.01";
    input.placeholder = "Amount";
    input.value = amount;

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.textContent = "❌";
    removeBtn.onclick = () => {
      availableBills.push(select.value);
      wrapper.remove();
      refreshAllSelects();
    };

    select.onchange = () => {
      refreshAllSelects();
    };

    wrapper.appendChild(select);
    wrapper.appendChild(input);
    wrapper.appendChild(removeBtn);
    billsContainer.appendChild(wrapper);

    availableBills = availableBills.filter(b => b !== select.value);
    refreshAllSelects();
  }

  function refreshAllSelects() {
    const selected = Array.from(document.querySelectorAll(".bill-entry select"))
      .map(select => select.value);

    document.querySelectorAll(".bill-entry select").forEach(select => {
      const current = select.value;
      select.innerHTML = "";

      billTypes.forEach(type => {
        if (!selected.includes(type) || type === current) {
          const option = document.createElement("option");
          option.value = type;
          option.textContent = type;
          select.appendChild(option);
        }
      });

      select.value = current;
    });

    availableBills = billTypes.filter(type => !selected.includes(type));
  }

  addBillBtn.addEventListener("click", () => {
    if (availableBills.length === 0) return alert("All bill types are already added.");
    createBillField();
  });

  budgetForm.onsubmit = (e) => {
    e.preventDefault();

    const income = parseFloat(incomeInput.value) || 0;
    const spouseIncome = parseFloat(spouseIncomeInput.value) || 0;
    const totalIncome = income + spouseIncome;

    const bills = Array.from(document.querySelectorAll(".bill-entry")).map(entry => {
      return {
        name: entry.querySelector("select").value,
        amount: parseFloat(entry.querySelector("input").value) || 0
      };
    });

    const totalBills = bills.reduce((sum, b) => sum + b.amount, 0);
    const remaining = totalIncome - totalBills;
    const usagePercent = Math.min(100, (totalBills / totalIncome) * 100);

    summaryText.innerHTML = `
      <p><strong>Total Income:</strong> $${totalIncome.toFixed(2)}</p>
      <p><strong>Total Bills:</strong> $${totalBills.toFixed(2)}</p>
      <p><strong>Remaining:</strong> $${remaining.toFixed(2)}</p>
    `;

    usageBar.style.width = `${usagePercent}%`;
    usageBar.className = usagePercent < 70 ? "bar green" :
                         usagePercent < 90 ? "bar orange" : "bar red";
    usageText.textContent = `Budget Usage: ${usagePercent.toFixed(1)}%`;

    generateChart(bills);
    adviceBox.innerHTML = generateAdvice(remaining, bills, totalIncome);
    resultsSection.style.display = "block";
  };

  function generateChart(bills) {
    if (window.budgetChart instanceof Chart) {
      window.budgetChart.destroy();
    }

    window.budgetChart = new Chart(chartCanvas, {
      type: 'pie',
      data: {
        labels: bills.map(b => b.name),
        datasets: [{
          data: bills.map(b => b.amount),
          backgroundColor: [
            '#4caf50', '#2196f3', '#ff9800', '#e91e63',
            '#9c27b0', '#3f51b5', '#00bcd4', '#ff5722',
            '#795548', '#607d8b'
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
      advice += `<p>⚠️ <strong>You are overspending by $${Math.abs(remaining).toFixed(2)}.</strong> Consider cutting back on non-essential bills or increasing your income.</p>`;
    } else if (remaining === 0) {
      advice += `<p>👍 Your budget is perfectly balanced. Try to save a little if possible for emergencies.</p>`;
    } else {
      advice += `<p>🎉 Great job! You have $${remaining.toFixed(2)} remaining after bills. Consider saving or investing this amount.</p>`;
    }

    if (bills.length > 0) {
      const biggest = bills.reduce((max, b) => b.amount > max.amount ? b : max, bills[0]);
      advice += `<p>Your biggest expense is <strong>${biggest.name}</strong> at $${biggest.amount.toFixed(2)}. Review if there's room to optimize here.</p>`;
    }

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
