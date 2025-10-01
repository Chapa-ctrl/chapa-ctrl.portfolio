let allProducts = [];
let products = [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let currentPage = 1;
const itemsPerPage = 5;

const productsContainer = document.getElementById("products");
const paginationContainer = document.getElementById("pagination");
const cartBtn = document.getElementById("cartBtn");
const cartDiv = document.getElementById("cart");
const cartItemsDiv = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const totalPrice = document.getElementById("totalPrice");

// Load products
async function loadProducts() {
  const res = await fetch("products.json");
  allProducts = await res.json();
  products = [...allProducts];
  renderProducts();
  renderPagination();
}
loadProducts();

// Render Products
function renderProducts() {
  productsContainer.innerHTML = "";
  const start = (currentPage - 1) * itemsPerPage;
  const paginated = products.slice(start, start + itemsPerPage);

  paginated.forEach(p => {
    const div = document.createElement("div");
    div.className = "product";
    div.innerHTML = `
      <img src="${p.image}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p>$${p.price}</p>
      <button onclick="addToCart(${p.id})">Add to Cart</button>
    `;
    productsContainer.appendChild(div);
  });
}

// Render Pagination
function renderPagination() {
  paginationContainer.innerHTML = "";
  const totalPages = Math.ceil(products.length / itemsPerPage);

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.innerText = i;
    btn.classList.toggle("active", i === currentPage);
    btn.onclick = () => {
      currentPage = i;
      renderProducts();
      renderPagination();
    };
    paginationContainer.appendChild(btn);
  }
}

// Cart Functions
function addToCart(id) {
  const item = allProducts.find(p => p.id === id);
  const existing = cart.find(c => c.id === id);

  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...item, qty: 1 });
  }

  saveCart();
  renderCart();
}

function renderCart() {
  cartItemsDiv.innerHTML = "";
  let total = 0;

  cart.forEach(item => {
    total += item.price * item.qty;
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <span>${item.name} - $${item.price} x ${item.qty}</span>
      <div class="cart-controls">
        <button onclick="decreaseQty(${item.id})">➖</button>
        <button onclick="increaseQty(${item.id})">➕</button>
        <button onclick="removeFromCart(${item.id})">🗑</button>
      </div>
    `;
    cartItemsDiv.appendChild(div);
  });

  totalPrice.innerText = "Total: $" + total.toFixed(2);
  cartCount.innerText = cart.reduce((sum, i) => sum + i.qty, 0);
}

function increaseQty(id) {
  const item = cart.find(i => i.id === id);
  if (item) item.qty++;
  saveCart();
  renderCart();
}

function decreaseQty(id) {
  const item = cart.find(i => i.id === id);
  if (item && item.qty > 1) {
    item.qty--;
  } else {
    cart = cart.filter(i => i.id !== id);
  }
  saveCart();
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
  renderCart();
}


function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
  renderCart();
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// Cart Buttons
cartBtn.onclick = () => cartDiv.classList.toggle("hidden");
document.getElementById("closeCart").onclick = () => cartDiv.classList.add("hidden");
document.getElementById("clearCart").onclick = () => { cart = []; saveCart(); renderCart(); };

// Search
document.getElementById("searchBar").addEventListener("input", e => {
  const q = e.target.value.toLowerCase();
  if (q === "") {
    products = [...allProducts]; // reset to all
  } else {
    products = allProducts.filter(p => p.name.toLowerCase().includes(q));
  }
  currentPage = 1;
  renderProducts();
  renderPagination();
});

// Sorting
document.getElementById("sortOptions").addEventListener("change", e => {
  const v = e.target.value;
  if (v === "az") products.sort((a,b) => a.name.localeCompare(b.name));
  if (v === "za") products.sort((a,b) => b.name.localeCompare(a.name));
  if (v === "lowHigh") products.sort((a,b) => a.price - b.price);
  if (v === "highLow") products.sort((a,b) => b.price - a.price);
  currentPage = 1;
  renderProducts();
  renderPagination();
});

// Landing Page → Shop
document.getElementById("enterShop").onclick = () => {
  document.getElementById("landing").classList.add("hidden");
  document.getElementById("shopPage").classList.remove("hidden");
};

// Load cart on start
renderCart();
