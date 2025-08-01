document.addEventListener("DOMContentLoaded", function () {
  const billFields = document.getElementById("billFields");
  const addBillBtn = document.getElementById("addBillBtn");
  const calculateBtn = document.getElementById("calculateBtn");
  const resultsDiv = document.getElementById("results");

  function addBillField() {
    billFields.insertAdjacentHTML("beforeend", `
      <div class="bill">
        <input type="text" placeholder="Bill name" class="bill-name" />
        <input type="number" placeholder="Amount ($)" class="bill-amount" />
      </div>
    `);
  }

  function calculateBudget() {
    const income = parseFloat(document.getElementById("income").value);
    if (isNaN(income) || income <= 0) {
      resultsDiv.innerHTML = "<p class='error'>Please enter a valid income.</p>";
      return;
    }

    const bills = document.querySelectorAll(".bill");
    let totalBills = 0;

    bills.forEach(bill => {
      const amount = parseFloat(bill.querySelector(".bill-amount").value) || 0;
      totalBills += amount;
    });

    const remaining = income - totalBills;

    resultsDiv.innerHTML = `
      <p>Total Bills: $${totalBills.toFixed(2)}</p>
      <p>Remaining Balance: $${remaining.toFixed(2)}</p>
    `;

    if (remaining < 0) {
      resultsDiv.innerHTML += "<p class='warning'>You're over budget!</p>";
    } else if (remaining < income * 0.2) {
      resultsDiv.innerHTML += "<p class='caution'>Warning: You have less than 20% of your income left.</p>";
    } else {
      resultsDiv.innerHTML += "<p class='good'>You're on track. Keep it up!</p>";
    }
  }

  addBillBtn.onclick = addBillField;
  calculateBtn.onclick = calculateBudget;
});
