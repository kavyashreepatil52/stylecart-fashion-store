
const products = [
  {id:1,name:"Elegant Dress",category:"Women",price:1499,description:"A beautiful outfit for every occasion.",image:"https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600"},
  {id:2,name:"Classic Outfit",category:"Women",price:1899,description:"Timeless style with a modern touch.",image:"https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600"},
  {id:3,name:"Everyday Style",category:"Women",price:999,description:"Comfortable fashion for everyday wear.",image:"https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600"},
  {id:4,name:"Casual Shirt",category:"Men",price:1299,description:"A smart casual look for every day.",image:"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600"},
  {id:5,name:"Classic Jacket",category:"Men",price:2499,description:"A stylish addition to your wardrobe.",image:"https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600"},
  {id:6,name:"Urban Outfit",category:"Men",price:1799,description:"A clean and modern everyday look.",image:"https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=600"},
  {id:7,name:"Elegant Handbag",category:"Accessories",price:1599,description:"A stylish accessory for your look.",image:"https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600"},
  {id:8,name:"Classic Sunglasses",category:"Accessories",price:799,description:"Complete your outfit with confidence.",image:"https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600"},
  {id:9,name:"Minimal Watch",category:"Accessories",price:2199,description:"Simple design with timeless appeal.",image:"https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600"}
];

function loadData(key, fallback) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (error) {
    return fallback;
  }
}

function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function formatPrice(amount) {
  return "₹" + Number(amount).toLocaleString("en-IN");
}

let cart = loadData("stylecart-cart", []);
let wishlist = loadData("stylecart-wishlist", []);
let orders = loadData("stylecart-orders", []);

if (!Array.isArray(cart)) cart = [];
if (!Array.isArray(wishlist)) wishlist = [];
if (!Array.isArray(orders)) orders = [];

/* Keep only valid cart items from earlier versions */
cart = cart.filter(item =>
  item && products.some(p => p.id === Number(item.id)) &&
  Number(item.quantity) > 0
).map(item => ({
  id: Number(item.id),
  size: item.size || "M",
  quantity: Number(item.quantity)
}));

let selectedCategory = "All";
let searchTerm = "";
let wishlistOnly = false;

function getProduct(id) {
  return products.find(p => p.id === Number(id));
}

function getCartTotal() {
  return cart.reduce((sum, item) => {
    const p = getProduct(item.id);
    return sum + (p ? p.price * item.quantity : 0);
  }, 0);
}

function updateCartCount() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById("cart-count").textContent = count;
}

function renderProducts() {
  const grid = document.getElementById("product-grid");
  grid.innerHTML = "";

  let shown = products.filter(p => {
    return (
      (selectedCategory === "All" || p.category === selectedCategory) &&
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (!wishlistOnly || wishlist.includes(p.id))
    );
  });

  const sort = document.getElementById("sort-products").value;

  if (sort === "low") shown.sort((a,b) => a.price - b.price);
  if (sort === "high") shown.sort((a,b) => b.price - a.price);

  if (shown.length === 0) {
    grid.innerHTML = '<p class="empty-message">No products found.</p>';
    return;
  }

  shown.forEach(p => {
    const card = document.createElement("article");
    card.className = "product-card";

    card.innerHTML = `
      <div class="product-image">
        <img src="${p.image}" alt="${p.name}" loading="lazy">
      </div>
      <div class="product-info">
        <p>${p.category}</p>
        <h3>${p.name}</h3>
        <p>${p.description}</p>
        <div class="product-price">${formatPrice(p.price)}</div>
        <div class="product-actions">
          <button class="details-button">View Details</button>
          <button class="wish-button">${wishlist.includes(p.id) ? "♥" : "♡"}</button>
          <button class="add-button">Add to Bag</button>
        </div>
      </div>
    `;

    const image = card.querySelector("img");
    image.onerror = () => {
      image.style.display = "none";
      image.parentElement.textContent = p.name;
    };

    card.querySelector(".details-button").onclick = () => showDetails(p.id);
    card.querySelector(".wish-button").onclick = () => toggleWishlist(p.id);
    card.querySelector(".add-button").onclick = () => addToCart(p.id);

    grid.appendChild(card);
  });
}

function toggleWishlist(id) {
  if (wishlist.includes(id)) {
    wishlist = wishlist.filter(x => x !== id);
  } else {
    wishlist.push(id);
  }

  saveData("stylecart-wishlist", wishlist);
  renderProducts();
}

function addToCart(id, size = "M") {
  const existing = cart.find(x => x.id === id && x.size === size);

  if (existing) {
    existing.quantity++;
  } else {
    cart.push({id:id, size:size, quantity:1});
  }

  saveData("stylecart-cart", cart);
  updateCartCount();
  renderCart();
}

function changeQuantity(id, size, amount) {
  const item = cart.find(x => x.id === id && x.size === size);
  if (!item) return;

  item.quantity += amount;

  if (item.quantity <= 0) {
    cart = cart.filter(x => !(x.id === id && x.size === size));
  }

  saveData("stylecart-cart", cart);
  renderCart();
  updateCartCount();
}

function renderCart() {
  const container = document.getElementById("cart-items");
  container.innerHTML = "";

  if (cart.length === 0) {
    container.innerHTML = '<p class="empty-message">Your bag is empty.</p>';
  }

  cart.forEach(item => {
    const p = getProduct(item.id);
    if (!p) return;

    const row = document.createElement("div");
    row.className = "cart-item";

    row.innerHTML = `
      <div>
        <strong>${p.name}</strong>
        <p>Size: ${item.size} | ${formatPrice(p.price)}</p>
        <div class="quantity-controls">
          <button class="minus">−</button>
          <span>${item.quantity}</span>
          <button class="plus">+</button>
          <button class="remove">Remove</button>
        </div>
      </div>
      <strong>${formatPrice(p.price * item.quantity)}</strong>
    `;

    row.querySelector(".minus").onclick =
      () => changeQuantity(item.id, item.size, -1);

    row.querySelector(".plus").onclick =
      () => changeQuantity(item.id, item.size, 1);

    row.querySelector(".remove").onclick = () => {
      cart = cart.filter(x => !(x.id === item.id && x.size === item.size));
      saveData("stylecart-cart", cart);
      renderCart();
      updateCartCount();
    };

    container.appendChild(row);
  });

  document.getElementById("cart-total").textContent = formatPrice(getCartTotal());
  document.getElementById("checkout-total").textContent = formatPrice(getCartTotal());
}

const summary = document.getElementById("checkout-order-items");

if (summary) {
  summary.innerHTML = "";

  cart.forEach(item => {
    const product = getProduct(item.id);
    if (!product) return;

    const line = document.createElement("div");
    line.className = "checkout-summary-item";

    const name = document.createElement("span");
    name.textContent =
      product.name + " (" + item.size + ") × " + item.quantity;

    const price = document.createElement("strong");
    price.textContent = formatPrice(product.price * item.quantity);

    line.append(name, price);
    summary.appendChild(line);
  });
}


function openModal(id) {
  document.getElementById(id).classList.add("show");
}

function closeModal(id) {
  document.getElementById(id).classList.remove("show");
}

function showDetails(id) {
  const p = getProduct(id);

  document.getElementById("product-details").innerHTML = `
    <p class="tag">${p.category}</p>
    <h2>${p.name}</h2>
    <p>${p.description}</p>
    <h3>${formatPrice(p.price)}</h3>
    <p>Select Size:</p>
    <select id="product-size">
      <option value="S">S</option>
      <option value="M" selected>M</option>
      <option value="L">L</option>
      <option value="XL">XL</option>
    </select>
    <button class="primary-button full-button" id="detail-add">
      Add to Bag
    </button>
  `;

  document.getElementById("detail-add").onclick = () => {
    const size = document.getElementById("product-size").value;
    addToCart(id, size);
    closeModal("product-modal");
  };

  openModal("product-modal");
}

/* CART BUTTON */
document.getElementById("open-cart").onclick = () => {
  renderCart();
  openModal("cart-modal");
};

/* CLOSE BUTTONS */
document.querySelectorAll("[data-close]").forEach(button => {
  button.onclick = () => closeModal(button.dataset.close);
});

document.querySelectorAll(".modal").forEach(modal => {
  modal.onclick = event => {
    if (event.target === modal) modal.classList.remove("show");
  };
});

/* CATEGORY FILTER */
document.querySelectorAll(".filter-button").forEach(button => {
  button.onclick = () => {
    document.querySelectorAll(".filter-button").forEach(b =>
      b.classList.remove("active")
    );

    button.classList.add("active");
    selectedCategory = button.dataset.category;
    wishlistOnly = false;
    renderProducts();
  };
});

/* SEARCH */
document.getElementById("search-input").oninput = event => {
  searchTerm = event.target.value;
  wishlistOnly = false;
  renderProducts();
};

document.getElementById("search-button").onclick = () => {
  searchTerm = document.getElementById("search-input").value;
  renderProducts();
};

/* SORT */
document.getElementById("sort-products").onchange = renderProducts;

/* WISHLIST */
document.getElementById("show-wishlist").onclick = () => {
  wishlistOnly = !wishlistOnly;
  selectedCategory = "All";

  document.querySelectorAll(".filter-button").forEach(b => {
    b.classList.toggle("active", b.dataset.category === "All");
  });

  renderProducts();
  document.getElementById("products").scrollIntoView();
};

/* CHECKOUT */
document.getElementById("checkout-button").onclick = () => {
  if (cart.length === 0) {
    alert("Your shopping bag is empty.");
    return;
  }

  renderCart();
  closeModal("cart-modal");
  openModal("checkout-modal");
};

/* PLACE ORDER */
/* PLACE ORDER */
document.getElementById("checkout-form").onsubmit = event => {
  event.preventDefault();

  if (!currentUser) {
    alert("Please login before placing your order.");
    closeModal("checkout-modal");
    document.getElementById("account").scrollIntoView({
      behavior: "smooth"
    });
    return;
  }

  if (cart.length === 0) {
    alert("Your shopping bag is empty.");
    return;
  }

  const customer = Object.fromEntries(
    new FormData(event.target).entries()
  );

  // Connect order to the logged-in customer
  customer.name = currentUser.name;
  customer.email = currentUser.email;

  const orderId = "SC" + Date.now().toString().slice(-8);

  const order = {
    orderId,
    customer,
    items: cart.map(item => {
      const p = getProduct(item.id);
      return {
        id: item.id,
        productName: p.name,
        price: p.price,
        size: item.size,
        quantity: item.quantity
      };
    }),
    total: getCartTotal(),
    status: "Pending",
    createdAt: new Date().toISOString()
  };

  orders.push(order);
  saveData("stylecart-orders", orders);

  cart = [];
  saveData("stylecart-cart", cart);

  renderCart();
  updateCartCount();

  event.target.reset();
  closeModal("checkout-modal");

  document.getElementById("success-order-id").textContent = orderId;

  openModal("success-modal");
  renderAdmin();
  renderMyOrders();
};



/* ADMIN DASHBOARD */
function renderAdmin() {
  const table = document.getElementById("admin-order-list");
  table.innerHTML = "";

  let sales = 0;
  let pending = 0;
  let confirmed = 0;

  orders.forEach((order, index) => {
    const status = order.status || "Pending";
    sales += Number(order.total) || 0;

    if (status === "Pending") pending++;
    if (status === "Confirmed") confirmed++;

    const row = document.createElement("tr");

    const values = [
      order.orderId,
      order.customer?.name,
      (order.items || []).map(x =>
        x.productName + " × " + x.quantity
      ).join(", "),
      formatPrice(order.total),
      order.customer?.payment
    ];

    values.forEach(value => {
      const cell = document.createElement("td");
      cell.textContent = value || "N/A";
      row.appendChild(cell);
    });

    const statusCell = document.createElement("td");
    const select = document.createElement("select");

    ["Pending","Confirmed","Shipped","Delivered","Cancelled"].forEach(value => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      option.selected = value === status;
      select.appendChild(option);
    });

    select.onchange = () => {
      orders[index].status = select.value;
      saveData("stylecart-orders", orders);
      renderAdmin();
    };

    statusCell.appendChild(select);
    row.appendChild(statusCell);
    table.appendChild(row);
  });

  document.getElementById("total-orders").textContent = orders.length;
  document.getElementById("total-sales").textContent = formatPrice(sales);
  document.getElementById("pending-orders").textContent = pending;
  document.getElementById("confirmed-orders").textContent = confirmed;
  document.getElementById("admin-empty").hidden = orders.length > 0;
}

document.getElementById("refresh-orders").onclick = renderAdmin;

/* INITIAL DISPLAY */
saveData("stylecart-cart", cart);
renderProducts();
renderCart();
updateCartCount();
renderAdmin();

console.log("StyleCart loaded successfully!");

/* CUSTOMER ORDER TRACKING */

document.getElementById("track-order-button").addEventListener("click", () => {
  const input = document.getElementById("tracking-order-id");
  const result = document.getElementById("tracking-result");

  const enteredId = input.value.trim().toUpperCase();

  result.innerHTML = "";

  if (!enteredId) {
    result.textContent = "Please enter your Order ID.";
    return;
  }

  const savedOrders = loadData("stylecart-orders", []);
  const foundOrder = savedOrders.find(order =>
    String(order.orderId).toUpperCase() === enteredId
  );

  if (!foundOrder) {
    result.textContent = "Sorry, no order found. Please check your Order ID.";
    return;
  }

  const card = document.createElement("div");
  card.className = "tracking-card";

  const heading = document.createElement("h3");
  heading.textContent = "Order Found!";

  const orderId = document.createElement("p");
  orderId.textContent = "Order ID: " + foundOrder.orderId;

  const amount = document.createElement("p");
  amount.textContent = "Order Total: " + formatPrice(foundOrder.total);

  const date = document.createElement("p");
  date.textContent = "Order Date: " +
    new Date(foundOrder.createdAt).toLocaleDateString("en-IN");

  const status = document.createElement("div");
  status.className = "tracking-status";
  status.textContent = "Status: " + (foundOrder.status || "Pending");

  card.append(heading, orderId, amount, date, status);
  result.appendChild(card);
});

document.getElementById("tracking-order-id").addEventListener("keydown", event => {
  if (event.key === "Enter") {
    document.getElementById("track-order-button").click();
  }
});
/* CUSTOMER LOGIN AND REGISTRATION */

const accountForms = document.getElementById("account-forms");
const accountProfile = document.getElementById("account-profile");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const accountMessage = document.getElementById("account-message");

let currentUser = loadData("stylecart-current-user", null);

function showAccountMessage(message) {
  accountMessage.textContent = message;
}

function displayAccount() {
  if (currentUser) {
    accountForms.hidden = true;
    accountProfile.hidden = false;

    document.getElementById("account-name").textContent =
      currentUser.name;

    document.getElementById("account-email").textContent =
      currentUser.email;
  } else {
    accountForms.hidden = false;
    accountProfile.hidden = true;
  }
}

document.getElementById("login-tab").onclick = () => {
  loginForm.hidden = false;
  registerForm.hidden = true;

  document.getElementById("login-tab").classList.add("active");
  document.getElementById("register-tab").classList.remove("active");

  showAccountMessage("");
};

document.getElementById("register-tab").onclick = () => {
  loginForm.hidden = true;
  registerForm.hidden = false;

  document.getElementById("register-tab").classList.add("active");
  document.getElementById("login-tab").classList.remove("active");

  showAccountMessage("");
};

registerForm.onsubmit = event => {
  event.preventDefault();

  const name = document.getElementById("register-name").value.trim();
  const email = document.getElementById("register-email").value.trim().toLowerCase();
  const password = document.getElementById("register-password").value;

  let users = loadData("stylecart-users", []);
  if (!Array.isArray(users)) users = [];

  if (users.some(user => user.email === email)) {
    showAccountMessage("This email is already registered. Please login.");
    return;
  }

  users.push({ name, email, password });

  saveData("stylecart-users", users);

  registerForm.reset();
  loginForm.hidden = false;
  registerForm.hidden = true;

  document.getElementById("login-tab").classList.add("active");
  document.getElementById("register-tab").classList.remove("active");

  document.getElementById("login-email").value = email;

  showAccountMessage("Account created! Please login.");
};

loginForm.onsubmit = event => {
  event.preventDefault();

  const email = document.getElementById("login-email").value.trim().toLowerCase();
  const password = document.getElementById("login-password").value;

  const users = loadData("stylecart-users", []);

  const user = users.find(item =>
    item.email === email && item.password === password
  );

  if (!user) {
    showAccountMessage("Incorrect email or password.");
    return;
  }

  currentUser = {
    name: user.name,
    email: user.email
  };

  saveData("stylecart-current-user", currentUser);

  loginForm.reset();
  showAccountMessage("");
  displayAccount();
};

document.getElementById("logout-button").onclick = () => {
  currentUser = null;
  localStorage.removeItem("stylecart-current-user");

  displayAccount();
  showAccountMessage("You have logged out successfully.");
};

displayAccount();
function renderMyOrders() {
  const container = document.getElementById("my-orders-list");

  if (!container) return;

  container.innerHTML = "";

  if (!currentUser) {
    container.textContent = "Please login to view your orders.";
    return;
  }

  const allOrders = loadData("stylecart-orders", []);

  const myOrders = allOrders.filter(order =>
    order.customer &&
    order.customer.email &&
    order.customer.email.toLowerCase() === currentUser.email.toLowerCase()
  );

  if (myOrders.length === 0) {
    container.textContent = "You haven't placed any orders yet.";
    return;
  }

  myOrders.sort((a, b) =>
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  myOrders.forEach(order => {
    const card = document.createElement("div");
    card.className = "my-order-card";

    const heading = document.createElement("h3");
    heading.textContent = "Order " + order.orderId;

    const date = document.createElement("p");
    date.textContent = "Date: " +
      new Date(order.createdAt).toLocaleDateString("en-IN");

    const total = document.createElement("p");
    total.textContent = "Total: " + formatPrice(order.total);

    const itemsTitle = document.createElement("p");
    itemsTitle.textContent = "Products:";

    const items = document.createElement("div");
    items.className = "my-order-items";

    (order.items || []).forEach(item => {
      const itemLine = document.createElement("p");
      itemLine.textContent =
        (item.productName || item.name || "Product") +
        " × " + (item.quantity || 1);

      items.appendChild(itemLine);
    });

    const status = document.createElement("div");
    status.className = "my-order-status";
    status.textContent = "Status: " + (order.status || "Pending");

    card.append(heading, date, total, itemsTitle, items, status);
    container.appendChild(card);
  });
}

renderMyOrders();
