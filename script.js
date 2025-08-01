document.addEventListener("DOMContentLoaded", function () {
  const billContainer = document.getElementById("billContainer");
  const addBillBtn = document.getElementById("addBillBtn");
  const budgetForm = document.getElementById("budgetForm");
  const summarySection = document.getElementById("budgetSummary");
  const usageSection = document.getElementById("usageSection");
  const breakdownSection = document.getElementById("breakdownSection");
  const adviceSection = document.getElementById("adviceSection");
  const exportBtn = document.getElementById("exportBtn");

  const billTypes = [
    "Rent/Mortgage", "Utilities", "Internet", "Phone", "Groceries",
    "Transportation", "Insurance", "Loans", "Subscriptions", "Childcare",
    "Savings", "Other"
  ];

  function createBillField() {
    if (!billContainer) return;

    const div = document.createElement("div");
    div.className = "bill-field";

    const select = document.createElement("select");
    select.name = "billType[]";
    billTypes.forEach(type => {
      const option = document.createElement("option");
      option.value = type;
      option.textContent = type;
      select.appendChild(option);
    });

    const input = document.createElement("input");
    input.type = "number";
    input.name = "billAmount[]";
    input.placeholder = "Amount";
    input.required = true;

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.textContent = "Remove";
    removeBtn.className = "remove-btn";
    removeBtn.onclick = () => div.remove();

    div.appendChild(select);
    div.appendChild(input);
    div.appendChild(removeBtn);
    billContainer.appendChild(div);
  }

  addBillBtn?.addEventListener("click", createBillField);

  // Initialize with one bill field
  createBillField();

  budgetForm.onsubmit = function (e) {
    e.preventDefault();

    const income = parseFloat(document.getElementById("income").value);
    const billAmounts = Array.from(document.getElementsByName("billAmount[]")).map(input => parseFloat(input.value) || 0);
    const totalBills = billAmounts.reduce((acc, curr) => acc + curr, 0);
    const remaining = income - totalBills;
    const usage = (totalBills / income) * 100;

    document.getElementById("totalBills").textContent = `$${totalBills.toFixed(2)}`;
    document.getElementById("remainingBudget").textContent = `$${remaining.toFixed(2)}`;
    document.getElementById("usagePercent").textContent = `${usage.toFixed(1)}%`;

    summarySection.style.display = "block";
    usageSection.style.display = "block";
    breakdownSection.style.display = "block";
    adviceSection.style.display = "block";
    exportBtn.style.display = "inline-block";

    generateChart(income, totalBills);
    generateAdvice(remaining, totalBills, income);
  };

  function generateChart(income, bills) {
    const ctx = document.getElementById("budgetChart").getContext("2d");
    if (window.budgetChart) {
      window.budgetChart.destroy();
    }

    window.budgetChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Bills", "Remaining"],
        datasets: [{
          data: [bills, income - bills],
          backgroundColor: ["#ff4d4d", "#4caf50"],
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
    let advice = "";

    if (remaining < 0) {
      advice += `<p>⚠️ <strong>You are overspending by $${Math.abs(remaining).toFixed(2)}. Review your bills.</strong></p>`;
    } else if (remaining < income * 0.2) {
      advice += `<p>💡 <strong>Consider cutting non-essential expenses to increase savings.</strong></p>`;
    } else {
      advice += `<p>✅ <strong>Good job! You're managing your finances wisely. Consider investing or saving more.</strong></p>`;
    }

    document.getElementById("adviceText").innerHTML = advice;
  }

  exportBtn?.addEventListener("click", function () {
    const exportArea = document.getElementById("exportArea");
    if (!exportArea) return;

    const opt = {
      margin: 0.5,
      filename: "Budget_Summary.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" }
    };

    html2pdf().from(exportArea).set(opt).save();
  });
});
