// --- Data State ---
let products = JSON.parse(localStorage.getItem('biz_products')) || [];
let sales = JSON.parse(localStorage.getItem('biz_sales')) || [];
let expenses = JSON.parse(localStorage.getItem('biz_expenses')) || [];

const LOW_STOCK_THRESHOLD = 5;

// --- Initialize App ---
document.addEventListener('DOMContentLoaded', () => {
  renderAll();

  // Attach Form Event Listeners
  document.getElementById('product-form').addEventListener('submit', handleAddProduct);
  document.getElementById('sale-form').addEventListener('submit', handleRecordSale);
  document.getElementById('expense-form').addEventListener('submit', handleAddExpense);
});

// --- Navigation ---
function showSection(sectionId) {
  // Hide all sections
  document.querySelectorAll('.app-section').forEach(section => {
    section.classList.remove('active');
  });

  // Deactivate all nav buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  // Show active section & highlight corresponding button
  document.getElementById(sectionId).classList.add('active');
  
  const activeBtn = Array.from(document.querySelectorAll('.nav-btn')).find(btn => 
    btn.getAttribute('onclick').includes(sectionId)
  );
  if (activeBtn) activeBtn.classList.add('active');
}

// --- Local Storage Helpers ---
function saveData() {
  localStorage.setItem('biz_products', JSON.stringify(products));
  localStorage.setItem('biz_sales', JSON.stringify(sales));
  localStorage.setItem('biz_expenses', JSON.stringify(expenses));
  renderAll();
}

// --- Render Functions ---
function renderAll() {
  renderDashboard();
  renderProducts();
  renderSales();
  renderExpenses();
  updateProductDropdown();
}

function renderDashboard() {
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const totalSold = sales.reduce((sum, sale) => sum + sale.quantity, 0);

  document.getElementById('total-revenue').textContent = `₦${totalRevenue.toFixed(2)}`;
  document.getElementById('total-expenses').textContent = `₦${totalExpenses.toFixed(2)}`;
  document.getElementById('total-profit').textContent = `₦${netProfit.toFixed(2)}`;
  document.getElementById('total-sold').textContent = totalSold;

  // Low stock check
  const hasLowStock = products.some(p => p.stock <= LOW_STOCK_THRESHOLD);
  const alertBanner = document.getElementById('low-stock-alert');
  if (hasLowStock) {
    alertBanner.classList.remove('hidden');
  } else {
    alertBanner.classList.add('hidden');
  }
}

function renderProducts() {
  const tbody = document.getElementById('product-list');
  tbody.innerHTML = '';

  products.forEach((product, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${product.name}</td>
      <td>₦${product.price.toFixed(2)}</td>
      <td>
        ${product.stock} 
        ${product.stock <= LOW_STOCK_THRESHOLD ? '⚠️' : ''}
      </td>
      <td>
        <button class="btn-delete" onclick="deleteProduct(${index})">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function renderSales() {
  const tbody = document.getElementById('sales-list');
  tbody.innerHTML = '';

  sales.forEach(sale => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${sale.date}</td>
      <td>${sale.productName}</td>
      <td>${sale.quantity}</td>
      <td>₦${sale.total.toFixed(2)}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderExpenses() {
  const tbody = document.getElementById('expense-list');
  tbody.innerHTML = '';

  expenses.forEach(exp => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${exp.date}</td>
      <td>${exp.description}</td>
      <td>₦${exp.amount.toFixed(2)}</td>
    `;
    tbody.appendChild(tr);
  });
}

function updateProductDropdown() {
  const select = document.getElementById('sale-product-select');
  select.innerHTML = '<option value="" disabled selected>Select Product</option>';

  products.forEach((product, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = `${product.name} (${product.stock} in stock) - ₦${product.price.toFixed(2)}`;
    if (product.stock === 0) option.disabled = true;
    select.appendChild(option);
  });
}

// --- Action Handlers ---
function handleAddProduct(e) {
  e.preventDefault();
  const nameInput = document.getElementById('product-name');
  const priceInput = document.getElementById('product-price');
  const stockInput = document.getElementById('product-stock');

  const newProduct = {
    name: nameInput.value.trim(),
    price: parseFloat(priceInput.value),
    stock: parseInt(stockInput.value, 10)
  };

  products.push(newProduct);
  saveData();

  nameInput.value = '';
  priceInput.value = '';
  stockInput.value = '';
}

function handleRecordSale(e) {
  e.preventDefault();
  const select = document.getElementById('sale-product-select');
  const quantityInput = document.getElementById('sale-quantity');

  const productIndex = parseInt(select.value, 10);
  const qty = parseInt(quantityInput.value, 10);
  const product = products[productIndex];

  if (!product || qty > product.stock) {
    alert('Invalid quantity or stock unavailable!');
    return;
  }

  // Deduct stock
  product.stock -= qty;

  // Record sale
  const newSale = {
    productName: product.name,
    quantity: qty,
    total: product.price * qty,
    date: new Date().toLocaleDateString()
  };

  sales.unshift(newSale); // Newest sales first
  saveData();

  select.value = '';
  quantityInput.value = '';
}

function handleAddExpense(e) {
  e.preventDefault();
  const descInput = document.getElementById('expense-desc');
  const amountInput = document.getElementById('expense-amount');

  const newExpense = {
    description: descInput.value.trim(),
    amount: parseFloat(amountInput.value),
    date: new Date().toLocaleDateString()
  };

  expenses.unshift(newExpense); // Newest expenses first
  saveData();

  descInput.value = '';
  amountInput.value = '';
}

function deleteProduct(index) {
  if (confirm(`Are you sure you want to delete ${products[index].name}?`)) {
    products.splice(index, 1);
    saveData();
  }
}

// --- Clear / Reset Function ---
// --- Clear / Reset Sales & Expenses Only ---
function resetAllData() {
  const confirmed = confirm(
    'Are you sure you want to clear all sales and expenses? Your products will remain intact.'
  );

  if (confirmed) {
    // Clear Sales & Expenses from Local Storage
    localStorage.removeItem('biz_sales');
    localStorage.removeItem('biz_expenses');

    // Reset Sales & Expenses Arrays
    sales = [];
    expenses = [];

    // Re-render UI
    renderAll();
    alert('Sales and expenses tracking records have been cleared!');
  }
}