let billCount = 0; // 👈 Move this to the top

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("budgetForm");
  const summary = document.getElementById("summary");
  const advice = document.getElementById("advice");

  // Add initial bill input
  addBillField();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const income = parseFloat(document.getElementById("income").value) || 0;
    const partnerIncome = parseFloat(document.getElementById("partnerIncome").value) || 0;
    const totalIncome = income + partnerIncome;

    const bills = [];
    let totalExpenses = 0;

    for (let i = 0; i < billCount; i++) {
      const nameInput = document.getElementById(`billName${i}`);
      const valueInput = document.getElementById(`billValue${i}`);
      const tagInput = document.getElementById(`billTag${i}`);
      if (!nameInput || !valueInput) continue;

      const name = nameInput.value || `Bill ${i + 1}`;
      const value = parseFloat(valueInput.value) || 0;
      const tag = tagInput.value || 'Uncategorized';
      bills.push({ name, value, tag });
      totalExpenses += value;
    }

    const balance = totalIncome - totalExpenses;

    summary.innerHTML = `
      <h3>📋 Budget Summary</h3>
      <p><strong>Total Income:</strong> $${totalIncome.toFixed(2)}</p>
      <p><strong>Total Expenses:</strong> $${totalExpenses.toFixed(2)}</p>
      <p><strong>Balance:</strong> <span style="color:${balance >= 0 ? 'green' : 'red'}">$${balance.toFixed(2)}</span></p>
    `;

    advice.innerHTML = `<h3>💡 Smart Advice</h3><p>${generateAdvice(totalIncome, totalExpenses, bills, balance)}</p>`;
  });
});

function addBillField() {
  const container = document.getElementById("billFields");
  const id = billCount;
  const div = document.createElement("div");
  div.innerHTML = `
    <label>Bill Name: <input type="text" id="billName${id}" placeholder="e.g. Rent" /></label>
    <label>Amount: <input type="number" id="billValue${id}" /></label>
    <label>Tag: <input type="text" id="billTag${id}" placeholder="e.g. Housing, Utilities" /></label>
    <hr />
  `;
  container.appendChild(div);
  billCount++;
}

function exportPDF() {
  const content = document.querySelector(".container").cloneNode(true);
  const opt = {
    margin: 0.5,
    filename: 'Broke_Budget_Buddy_Report.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  };
  html2pdf().set(opt).from(content).save();
}

function generateAdvice(income, expenses, bills, balance) {
  if (income <= 0) return "🚨 You have no income reported. Consider emergency assistance or temporary jobs.";
  if (expenses === 0) return "✅ Great! No expenses listed. Double-check if that’s accurate.";
  if (balance < 0) return "❗ You're spending more than you earn. Cut unnecessary bills, seek side gigs, or reduce subscriptions.";

  const rent = bills.find(b => b.tag.toLowerCase().includes("rent"));
  const subscriptions = bills.filter(b => b.name.toLowerCase().includes("subscription"));

  let suggestions = [];

  if (rent && rent.value > income * 0.4) {
    suggestions.push("🏠 Rent is over 40% of your income. Consider downsizing or shared living.");
  }

  if (subscriptions.length > 2) {
    suggestions.push("📺 You have multiple subscriptions. Cancel unused ones to save.");
  }

  if (balance > income * 0.3) {
    suggestions.push("📈 You have good savings potential. Consider investing or building an emergency fund.");
  } else {
    suggestions.push("💵 Try to save at least 10-20% of your income monthly.");
  }

  return suggestions.join(" ");
}
