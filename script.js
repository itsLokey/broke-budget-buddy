document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("budget-form");
  const incomeInput = document.getElementById("income");
  const partnerIncomeInput = document.getElementById("partnerIncome");
  const resultSection = document.getElementById("results");
  const summary = document.getElementById("summary");
  const advice = document.getElementById("advice");
  const exportBtn = document.getElementById("export-pdf-btn");
  const progressBar = document.getElementById("progress-bar");
  const progressText = document.getElementById("progress-text");
  const chartCanvas = document.getElementById("budgetChart");

  let budgetChart = null;

  // Enable or disable bill amount input based on checkbox
  document.querySelectorAll(".bill-checkbox input[type='checkbox']").forEach((checkbox, index) => {
    const amountInput = document.querySelectorAll(".bill-amount")[index];
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        amountInput.disabled = false;
        amountInput.value = checkbox.dataset.default || "";
      } else {
        amountInput.disabled = true;
        amountInput.value = "";
      }
    });
  });

  form.onsubmit = function (e) {
    e.preventDefault();

    const income = parseFloat(incomeInput.value) || 0;
    const partnerIncome = parseFloat(partnerIncomeInput.value) || 0;
    const totalIncome = income + partnerIncome;

    const selectedCheckboxes = document.querySelectorAll(".bill-checkbox input[type='checkbox']:checked");
    const billAmounts = [];

    selectedCheckboxes.forEach((checkbox, index) => {
      const amountInput = checkbox.parentElement.querySelector(".bill-amount");
      const amount = parseFloat(amountInput.value) || 0;
      billAmounts.push({
        label: checkbox.nextElementSibling.innerText.trim(),
        value: amount
      });
    });

    const totalExpenses = billAmounts.reduce((sum, b) => sum + b.value, 0);
    const leftover = totalIncome - totalExpenses;
    const percentUsed = ((totalExpenses / totalIncome) * 100).toFixed(1);

    summary.innerHTML = `
      <p><strong>Total Income:</strong> $${totalIncome.toFixed(2)}</p>
      <p><strong>Total Bills:</strong> $${totalExpenses.toFixed(2)}</p>
      <p><strong>Remaining:</strong> $${leftover.toFixed(2)}</p>
    `;

    // Show hidden sections
    resultSection.classList.remove("hidden");
    document.querySelectorAll("#results h2, #export-pdf-btn, #progress-section").forEach(el => {
      el.classList.remove("hidden");
    });

    generateProgressBar(percentUsed);
    generateChart(billAmounts);
    generateAdvice(percentUsed, leftover);

    window.scrollTo({ top: resultSection.offsetTop, behavior: "smooth" });
  };

  function generateProgressBar(percent) {
    progressBar.style.width = `${percent}%`;
    progressBar.style.background = percent > 85 ? "red" : percent > 70 ? "orange" : "#4caf50";
    progressText.innerText = `${percent}% of your income is being used.`;
  }

  function generateChart(bills) {
    if (budgetChart) {
      budgetChart.destroy();
    }

    const labels = bills.map(b => b.label);
    const data = bills.map(b => b.value);

    budgetChart = new Chart(chartCanvas, {
      type: "pie",
      data: {
        labels,
        datasets: [{
          label: "Bill Amounts",
          data,
          backgroundColor: [
            "#4caf50", "#2196f3", "#ff9800", "#f44336", "#9c27b0", "#3f51b5", "#00bcd4"
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "bottom"
          }
        }
      }
    });
  }

  function generateAdvice(percent, leftover) {
    let message = "";

    if (percent > 90) {
      message = "⚠️ You're spending too much of your income on bills. Consider downsizing or cutting unnecessary expenses.";
    } else if (percent > 75) {
      message = "🧮 You're close to your budget limit. Try tracking smaller expenses like subscriptions.";
    } else if (percent > 50) {
      message = "📊 You're managing reasonably well. Consider putting more into savings or investments.";
    } else {
      message = "✅ Great job! You have a strong surplus. Make sure to use it wisely.";
    }

    if (leftover < 0) {
      message += "<br><strong>Warning:</strong> You're operating at a loss!";
    }

    advice.innerHTML = message;
  }

  exportBtn.onclick = function () {
    const element = document.getElementById("results");
    const opt = {
      margin: 0.5,
      filename: `Budget_Breakdown_${new Date().toISOString().split("T")[0]}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" }
    };

    html2pdf().set(opt).from(element).save();
  };
});
