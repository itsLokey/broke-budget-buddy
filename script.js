// Your JavaScript code here

function addBillField() {
  var billContainer = document.getElementById("displayedBills");
  var newBillField = `<label for="billName">Bill Name:</label><input type="text" id="billName"><label for="billAmount">Amount:</label><input type="number" id="billAmount"`;
  billContainer.innerHTML += newBillField;
}

function calculateBudget() {
  var income = document.getElementById("income").value;
  var bills = []; // Get all input fields with IDs starting with "billAmount"
  for (var i = 0; i < bills.length; i++) {
    var billAmount = parseInt(bills[i].value);
    bills[i] += billAmount;
  }
  var totalIncome = parseInt(income);
  var totalBills = bills.reduce((a, b) => a + b, 0);
  var remainingBudget = totalIncome - totalBills;
  document.getElementById("output").innerHTML = "Remaining Budget: $" + remainingBudget;

  // Generate bill-related advice
  if (remainingBudget < 0) {
    document.getElementById("billAdvice").innerHTML = "You have overspent on bills this month! Consider cutting unnecessary expenses or increasing your income.";
  } else if (remainingBudget < 500) {
    document.getElementById("billAdvice").innerHTML = "Your remaining budget is low for the month. You might need to cut back on some discretionary spending.";
  } else {
    document.getElementById("billAdvice").innerHTML = "Great job staying within your budget! Keep up the good work.";
  }

  // Generate personalized advice based on remaining budget and other factors
  if (emergencyMode.checked) {
    document.getElementById("personalizedAdvice").innerHTML = "In emergency mode, we recommend putting aside at least 20% of your income for unexpected expenses.";
  } else {
    document.getElementById("personalizedAdvice").innerHTML = "Congratulations on planning ahead! Consider setting some money aside for future savings or investing opportunities.";
  }
}

function saveAsPDF() {
  // Code to export to PDF
}
