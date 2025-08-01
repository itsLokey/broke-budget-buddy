function addBillField() {
  var billContainer = document.getElementById("displayedBills");
  var newBillField = `
    <div>
      <label>Bill Name:</label>
      <input type="text" class="billName">
      <label>Amount:</label>
      <input type="number" class="billAmount"><br>
    </div>`;
  billContainer.insertAdjacentHTML("beforeend", newBillField);
}

function calculateBudget() {
  var income = parseFloat(document.getElementById("income").value) || 0;

  var billInputs = document.getElementsByClassName("billAmount");
  var bills = [];
  for (var i = 0; i < billInputs.length; i++) {
    var billAmount = parseFloat(billInputs[i].value) || 0;
    bills.push(billAmount);
  }

  var totalBills = bills.reduce((a, b) => a + b, 0);
  var remainingBudget = income - totalBills;

  document.getElementById("output").innerHTML = "Remaining Budget: $" + remainingBudget.toFixed(2);

  if (remainingBudget < 0) {
    document.getElementById("billAdvice").innerHTML = "You have overspent on bills this month! Consider cutting unnecessary expenses or increasing your income.";
  } else if (remainingBudget < 500) {
    document.getElementById("billAdvice").innerHTML = "Your remaining budget is low for the month. You might need to cut back on some discretionary spending.";
  } else {
    document.getElementById("billAdvice").innerHTML = "Great job staying within your budget! Keep up the good work.";
  }

  var emergencyMode = document.getElementById("emergencyMode");
  if (emergencyMode && emergencyMode.checked) {
    document.getElementById("personalizedAdvice").innerHTML = "In emergency mode, we recommend putting aside at least 20% of your income for unexpected expenses.";
  } else {
    document.getElementById("personalizedAdvice").innerHTML = "Congratulations on planning ahead! Consider setting some money aside for future savings or investing opportunities.";
  }
}
