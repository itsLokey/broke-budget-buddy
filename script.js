document.addEventListener("DOMContentLoaded", function () {
  const billFields = document.getElementById("billFields");
  const budgetForm = document.getElementById("budgetForm");
  const resultsDiv = document.getElementById("summary");
  const adviceDiv = document.getElementById("advice");

  window.addBillField = function(name = "", amount = 0, tag = "Other") {
    billFields.insertAdjacentHTML("beforeend", `
      <div class="bill">
        <input type="text" placeholder="Bill name" class="bill-name" value="${name}" />
        <input type="number" placeholder="Amount ($)" class="bill-amount" value="${amount}" />
        <select class="bill-tag">
          <option value="" ${tag === "" ? "selected" : ""}>Category</option>
          <option value="rent" ${tag === "rent" ? "selected" : ""}>Rent</option>
          <option value="utilities" ${tag === "utilities" ? "selected" : ""}>Utilities</option>
          <option value="groceries" ${tag === "groceries" ? "selected" : ""}>Groceries</option>
          <option value="subscriptions" ${tag === "subscriptions" ? "selected" : ""}>Subscriptions</option>
          <option value="transport" ${tag === "transport" ? "selected" : ""}>Transport</option>
          <option value="debt" ${tag === "debt" ? "selected" : ""}>Debt</option>
          <option value="other" ${tag === "other" ? "selected" : ""}>Other</option>
        </select>
      </div>
    `);
  };

  function generateAdvice(remaining, income) {
    if (remaining < 0) return "You're spending more than you earn. Cut unnecessary expenses immediately or consider increasing income streams.";
    if (remaining < income * 0.2) return "You're close to breaking even. Prioritize essentials and build an emergency fund.";
    if (remaining >= income * 0.2 && remaining < income * 0.5) return "You're doing okay. Consider putting surplus into savings, investments, or paying down debt.";
    return "Excellent work! Maintain this balance, consider long-term goals, and revisit your budget monthly.";
  }

  budgetForm.addEventListener("submit", function(e) {
    e.preventDefault();

    const income = parseFloat(document.getElementById("income").value) || 0;
    const partnerIncome = parseFloat(document.getElementById("partnerIncome").value) || 0;
    const totalIncome = income + partnerIncome;

    if (totalIncome <= 0) {
      resultsDiv.innerHTML = "<p class='error'>Please enter valid income values.</p>";
      adviceDiv.innerHTML = "";
      return;
    }

    const bills = document.querySelectorAll(".bill");
    let totalBills = 0;
    const billSummary = [];

    bills.forEach(bill => {
      const name = bill.querySelector(".bill-name").value || "Unnamed";
      const amount = parseFloat(bill.querySelector(".bill-amount").value) || 0;
      const tag = bill.querySelector(".bill-tag").value || "Other";
      totalBills += amount;
      billSummary.push({ name, amount, tag });
    });

    const remaining = totalIncome - totalBills;
    const advice = generateAdvice(remaining, totalIncome);

    let summaryHTML = `
      <h3>Summary</h3>
      <p>Total Income: $${totalIncome.toFixed(2)}</p>
      <p>Total Bills: $${totalBills.toFixed(2)}</p>
      <p>Remaining Balance: $${remaining.toFixed(2)}</p>
      <h4>Bill Breakdown:</h4>
      <ul>
    `;
    billSummary.forEach(bill => {
      summaryHTML += `<li>${bill.name} (${bill.tag}): $${bill.amount.toFixed(2)}</li>`;
    });
    summaryHTML += `</ul>`;

    resultsDiv.innerHTML = summaryHTML;
    adviceDiv.innerHTML = `<p class="advice">${advice}</p>`;
  });

  window.exportPDF = function() {
    const element = document.getElementById("summary");
    if (!element) return;
    const opt = {
      margin:       0.5,
      filename:     'broke-budget-summary.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  // Add two default bills
  addBillField("Rent", 1000, "rent");
  addBillField("Groceries", 300, "groceries");
});
