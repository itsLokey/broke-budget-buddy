document.addEventListener('DOMContentLoaded', () => {
  const billsContainer = document.getElementById('bills-section');
  const addBillBtn = document.getElementById('addBill');
  const budgetForm = document.getElementById('budget-form');

  // List of predefined bills
  const predefinedBills = [
    { id: 'rent', label: 'Rent / Mortgage', default: 1200 },
    { id: 'utilities', label: 'Utilities (Electricity, Water)', default: 150 },
    { id: 'internet', label: 'Internet / Cable', default: 60 },
    { id: 'phone', label: 'Phone', default: 50 },
    { id: 'groceries', label: 'Groceries', default: 400 },
    { id: 'transport', label: 'Transport / Gas / Public Transit', default: 150 },
    { id: 'insurance', label: 'Insurance (Health, Car, Home)', default: 200 },
    { id: 'subscriptions', label: 'Subscriptions (Netflix, Spotify, etc.)', default: 50 },
    { id: 'debt', label: 'Debt Payments (Loans, Credit Cards)', default: 300 },
    { id: 'other', label: 'Other', default: 0 }
  ];

  // Keep track of selected bill IDs to avoid duplicates
  let selectedBillIds = new Set();

  // Create one bill input row (dropdown + amount + remove button)
  function createBillRow(selectedId = '', amount = '') {
    const row = document.createElement('div');
    row.className = 'bill';

    // Bill select dropdown
    const select = document.createElement('select');
    select.className = 'bill-name';
    select.required = true;

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '-- Select bill --';
    select.appendChild(defaultOption);

    predefinedBills.forEach(bill => {
      const option = document.createElement('option');
      option.value = bill.id;
      option.textContent = bill.label;
      if (bill.id === selectedId) option.selected = true;
      select.appendChild(option);
    });

    // Amount input
    const amountInput = document.createElement('input');
    amountInput.type = 'number';
    amountInput.min = '0';
    amountInput.step = '0.01';
    amountInput.className = 'bill-amount';
    amountInput.placeholder = 'Amount';
    amountInput.required = true;
    amountInput.value = amount || (selectedId ? getDefaultAmount(selectedId) : '');

    // Remove button
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-bill-btn';
    removeBtn.textContent = '×';

    // When bill selection changes
    select.addEventListener('change', () => {
      // Remove old selectedId if any
      selectedBillIds.delete(selectedId);
      selectedId = select.value;

      if (selectedId) {
        if (selectedBillIds.has(selectedId)) {
          alert('This bill is already selected. Please choose another.');
          select.value = '';
          amountInput.value = '';
          return;
        }
        selectedBillIds.add(selectedId);
      }

      // Reset amount to default if empty
      if (!amountInput.value) {
        amountInput.value = getDefaultAmount(selectedId);
      }

      updateBillSelectOptions();
    });

    // Remove bill row
    removeBtn.addEventListener('click', () => {
      if (selectedId) selectedBillIds.delete(selectedId);
      row.remove();
      updateBillSelectOptions();
    });

    row.appendChild(select);
    row.appendChild(amountInput);
    row.appendChild(removeBtn);

    return row;
  }

  // Get default amount for bill id
  function getDefaultAmount(id) {
    const bill = predefinedBills.find(b => b.id === id);
    return bill ? bill.default : '';
  }

  // Disable options in other selects if already selected in one
  function updateBillSelectOptions() {
    const selects = billsContainer.querySelectorAll('select.bill-name');
    const currentValues = new Set();

    selects.forEach(select => {
      if (select.value) currentValues.add(select.value);
    });

    selects.forEach(select => {
      const currentVal = select.value;
      [...select.options].forEach(option => {
        if (option.value === '') {
          option.disabled = false;
          return;
        }
        // Disable if selected elsewhere but not current select
        option.disabled = currentValues.has(option.value) && option.value !== currentVal;
      });
    });
  }

  // Add new bill row handler
  addBillBtn.addEventListener('click', () => {
    if (selectedBillIds.size >= predefinedBills.length) {
      alert('All predefined bills have been added.');
      return;
    }
    const newRow = createBillRow();
    billsContainer.appendChild(newRow);
    updateBillSelectOptions();
  });

  // Initialize with one bill row on page load
  billsContainer.appendChild(createBillRow());

  // You would continue to add your form submit and other logic here...
});
