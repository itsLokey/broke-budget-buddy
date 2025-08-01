document.getElementById("darkToggle").addEventListener("change", () => {
  document.body.classList.toggle("dark-mode");
});

function addBillField() {
  const template = document.getElementById("bill-template");
  const clone = template.content.cloneNode(true);
  document.getElementById("billsContainer").appendChild(clone);
}

function calculateBudget() {
  const income = parseFloat(document.getElementById("income").value) || 0;
  const partnerIncome = parseFloat(document.getElementById("partnerIncome").value) || 0;
  const totalIncome = income + partnerIncome;

  const emergency = document.getElementById("emergencyMode").checked;
  const bills = Array.from(document.querySelectorAll(".bill-entry"));
  
  let totalExpenses = 0;
  let breakdown = [];

  bills.forEach(entry => {
    const label = entry.querySelector("select").value;
    const amount = parseFloat(entry.querySelector("input").value) || 0;
    totalExpenses += amount;
    breakdown.push({ label, amount });
  });

  const remaining = totalIncome - totalExpenses;
  let output = `<h3>📊 Budget Summary</h3>`;
  output += `<p>Total Household Income: $${totalIncome.toFixed(2)}</p>`;
  output += `<p>Total Expenses: $${totalExpenses.toFixed(2)}</p>`;
  output += `<p>Remaining: $${remaining.toFixed(2)}</p><hr>`;
  output += `<ul>`;
  breakdown.forEach(b => {
    output += `<li>${b.label}: $${b.amount.toFixed(2)}</li>`;
  });
  output += `</ul>`;

  document.getElementById("output").innerHTML = output;

  // Dynamic smart advice
  let advice = `<h3>🧠 Smart Advice</h3>`;
  if (emergency) {
    advice += `<p><strong>Emergency Mode:</strong> Focus only on rent, food, utilities, and essential transport. Cut subscriptions and luxury expenses immediately.</p>`;
  } else {
    if (remaining > 500) {
      advice += `<p>You're in a strong financial position. Consider putting $${(remaining * 0.3).toFixed(2)} into savings or investments monthly.</p>`;
    } else if (remaining > 0) {
      advice += `<p>Your budget is balanced. Look for minor areas to reduce spending and improve your emergency fund.</p>`;
    } else {
      advice += `<p>⚠️ You're spending more than you earn. Review bills like subscriptions or optional insurance. Contact providers for hardship relief programs.</p>`;
    }
  }

  if (totalExpenses > totalIncome * 0.7) {
    advice += `<p>💡 Consider reducing fixed costs (like moving to a cheaper rental) or increasing income (side jobs, selling unused items).</p>`;
  }

  document.getElementById("advice").innerHTML = advice;
}

// PDF generation using browser print
function saveAsPDF() {
  window.print();
}
