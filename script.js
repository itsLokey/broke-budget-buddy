let billCount = 0;

document.addEventListener("DOMContentLoaded", () => {
  // Add the first bill field on load
  addBillField();

  const form = document.getElementById("budgetForm");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    calculateBudget();
  });
});

function addBillField() {
  const billFields = document.getElementById("billFields");

  const wrapper = document.createElement("div");
  wrapper.className = "bill-wrapper";
  wrapper.innerHTML = `
    <label for="billName${billCount}">Bill Name:</label>
    <input type="text" id="billName${billCount}" placeholder="e.g., Rent" />

    <label for="billAmount${billCount}">Bill Amount ($):</label>
    <input type="number" id="billAmount${billCount}" />
    <hr>
  `;

  billFields.appendChild(wrapper);
  billCount++;
}

function calculateBudget() {
  const income = parseFloat(document.getElementById("income").value) || 0;
  const partnerIncome = parseFloat(document.getElementById("partnerIncome").value) || 0;
  const totalIncome = income + partnerIncome;

  let totalBills = 0;
  let billDetails = [];

  for (let i = 0; i < billCount; i++) {
    const nameEl = document.getElementById(`billName${i}`);
    const amountEl = document.getElementById(`billAmount${i}`);
    if (!nameEl || !amountEl) continue;

    const name = nameEl.value || `Bill #${i + 1}`;
    const amount = parseFloat(amountEl.value) || 0;
    billDetails.push({ name, amount });
    totalBills += amount;
  }

  const leftOver = totalIncome - totalBills;
  const summaryBox = document.getElementById("summary");
  summaryBox.innerHTML = `
    <h2>📊 Budget Summary</h2>
    <p><strong>Total Income:</strong> $${totalIncome.toFixed(2)}</p>
    <p><strong>Total Bills:</strong> $${totalBills.toFixed(2)}</p>
    <p><strong>Remaining:</strong> $${leftOver.toFixed(2)}</p>
    <hr>
    <h3>Breakdown:</h3>
    <ul>
      ${billDetails.map(bill => `<li>${bill.name}: $${bill.amount.toFixed(2)}</li>`).join("")}
    </ul>
  `;

  generateAdvice(leftOver, totalIncome, billDetails);
}

function generateAdvice(remaining, income, bills) {
  const adviceBox = document.getElementById("advice");

  let advice = "";
  const percent = (remaining / income) * 100;

  if (remaining < 0) {
    advice += "<p>⚠️ You’re spending more than you earn. Consider reducing non-essential expenses or finding ways to boost income.</p>";
  } else if (percent < 10) {
    advice += "<p>⚠️ You have very little left over. Consider meal planning, reviewing subscriptions, or negotiating bill reductions.</p>";
  } else if (percent < 30) {
    advice += "<p>✅ You're doing okay, but there’s room to improve. Try allocating a fixed percent to savings.</p>";
  } else {
    advice += "<p>💰 Great job! Consider putting extra income into emergency savings, investments, or debt repayment.</p>";
  }

  // Add suggestions based on common bills
  const hasHighRent = bills.find(b => b.name.toLowerCase().includes("rent") && b.amount > income * 0.4);
  const hasSubscription = bills.find(b => b.name.toLowerCase().includes("netflix") || b.name.toLowerCase().includes("stream"));

  if (hasHighRent) {
    advice += "<p>🏠 Your rent is high compared to your income. Explore shared housing, subsidies, or relocation options.</p>";
  }
  if (hasSubscription) {
    advice += "<p>📺 Consider trimming streaming services or rotating them month-to-month to save money.</p>";
  }

  adviceBox.innerHTML = `<h2>💡 Smart Advice</h2>${advice}`;
}

function exportPDF() {
  const content = document.querySelector(".container");
  html2pdf().from(content).save("budget-summary.pdf");
}
