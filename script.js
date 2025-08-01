document.addEventListener("DOMContentLoaded", () => {
  const budgetForm = document.getElementById("budgetForm");
  const billsContainer = document.getElementById("billsContainer");
  const addBillBtn = document.getElementById("addBill");
  const resultsSection = document.getElementById("results");

  const predefinedBills = [
    "Rent", "Electricity", "Water", "Internet", "Phone",
    "Groceries", "Transportation", "Childcare", "Debt Payments"
  ];

  let selectedBills = [];

  function createBillField() {
    const wrapper = document.createElement("div");
    wrapper.classList.add("input-group");

    const select = document.createElement("select");
    predefinedBills.forEach(bill => {
      if (!selectedBills.includes(bill)) {
        const option = document.createElement("option");
        option.value = bill;
        option.textContent = bill;
        select.appendChild(option);
      }
    });

    const amount = document.createElement("input");
    amount.type = "number";
    amount.placeholder = "Amount";

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.textContent = "Remove";
    removeBtn.style.backgroundColor = "#ef4444";
    removeBtn.onclick = () => {
      const removedBill = select.value;
      selectedBills = selectedBills.filter(b => b !== removedBill);
      wrapper.remove();
    };

    select.onchange = () => {
      selectedBills.push(select.value);
      addBillBtn.disabled = selectedBills.length >= predefinedBills.length;
      select.querySelectorAll("option").forEach(option => {
        if (selectedBills.includes(option.value) && option.value !== select.value) {
          option.disabled = true;
        }
      });
    };

    wrapper.appendChild(select);
    wrapper.appendChild(amount);
    wrapper.appendChild(removeBtn);
    billsContainer.appendChild(wrapper);
  }

  addBillBtn.addEventListener("click", createBillField);

  budgetForm.onsubmit = (e) => {
    e.preventDefault();

    const income = parseFloat(document.getElementById("income").value || 0);
    const spouseIncome = parseFloat(document.getElementById("spouseIncome").value || 0);
    const totalIncome = income + spouseIncome;

    const bills = Array.from(billsContainer.children).map(group => {
      const [select, input] = group.querySelectorAll("select, input");
      return { name: select.value, amount: parseFloat(input.value || 0) };
    });

    const totalExpenses = bills.reduce((sum, bill) => sum + bill.amount, 0);
    const remaining = totalIncome - totalExpenses;
    const percentage = ((totalExpenses / totalIncome) * 100).toFixed(1);

    document.getElementById("summaryText").innerHTML = `
      <h3>Summary</h3>
      <p>Total Income: $${totalIncome}</p>
      <p>Total Expenses: $${totalExpenses}</p>
      <p>Remaining: $${remaining}</p>
    `;

    const bar = document.getElementById("usageBar");
    bar.style.width = `${Math.min(percentage, 100)}%`;
    bar.style.backgroundColor = percentage > 100 ? "#ef4444" : "#22c55e";

    document.getElementById("usageText").textContent = `You’ve used ${percentage}% of your budget`;

    generateChart(bills);
    generateAdvice(remaining, bills, totalIncome);

    resultsSection.style.display = "block";
  };

  function generateChart(bills) {
    if (window.budgetChart) {
      window.budgetChart.destroy();
    }

    const ctx = document.getElementById("chart").getContext("2d");
    window.budgetChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: bills.map(b => b.name),
        datasets: [{
          data: bills.map(b => b.amount),
          backgroundColor: [
            "#3b82f6", "#f59e0b", "#10b981", "#ef4444",
            "#6366f1", "#ec4899", "#14b8a6", "#f43f5e", "#8b5cf6"
          ],
          borderColor: "#fff",
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "bottom" },
          tooltip: { enabled: true }
        }
      }
    });
  }

  function generateAdvice(remaining, bills, income) {
    let advice = "<h3>Smart Financial Advice</h3>";

    if (remaining < 0) {
      advice += `<p>⚠️ You're overspending by $${Math.abs(remaining)}. Reduce your bills or find ways to increase your income.</p>`;
    } else if (remaining < income * 0.1) {
      advice += "<p>💡 You're close to maxing out your budget. Consider reducing non-essential expenses like entertainment or dining.</p>";
    } else {
      advice += "<p>✅ Great job! You're managing your budget well.</p>";
    }

    const highBills = bills.filter(b => b.amount > income * 0.3);
    if (highBills.length) {
      highBills.forEach(b => {
        advice += `<p>👉 ${b.name} seems high. Look into alternatives or ways to reduce this bill.</p>`;
      });
    }

    if (!bills.some(b => b.name.toLowerCase().includes("savings"))) {
      advice += "<p>📈 Consider allocating part of your income towards savings or an emergency fund.</p>";
    }

    document.getElementById("adviceBox").innerHTML = advice;
  }
});
