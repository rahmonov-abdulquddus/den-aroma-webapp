// Telegram Web App'ni ishga tushirish
let tg = window.Telegram.WebApp;

// Web App'ni to'liq ekran qilish
tg.expand();

// Asosiy ma'lumotlar
let currentView = "catalog";
let cart = [];
let products = [
  {
    id: 1,
    name: "Aroma Oqbilol - Premium",
    price: 150000,
    description: "Eng yaxshi sifatli aroma oqbilol",
    image:
      "https://via.placeholder.com/300x200/667eea/ffffff?text=Aroma+Oqbilol",
  },
  {
    id: 2,
    name: "Aroma Oqbilol - Classic",
    price: 120000,
    description: "Klassik aroma oqbilol",
    image:
      "https://via.placeholder.com/300x200/764ba2/ffffff?text=Classic+Oqbilol",
  },
  {
    id: 3,
    name: "Aroma Oqbilol - Deluxe",
    price: 180000,
    description: "Deluxe versiya aroma oqbilol",
    image:
      "https://via.placeholder.com/300x200/667eea/ffffff?text=Deluxe+Oqbilol",
  },
];

// Sahifani yuklash
document.addEventListener("DOMContentLoaded", function () {
  showCatalog();
  updateCartCount();
});

// Katalog ko'rsatish
function showCatalog() {
  currentView = "catalog";
  document.getElementById("catalog").style.display = "block";
  document.getElementById("cart").style.display = "none";

  // Navigation tugmalarini yangilash
  updateNavigation();

  // Mahsulotlarni ko'rsatish
  displayProducts();
}

// Savatcha ko'rsatish
function showCart() {
  currentView = "cart";
  document.getElementById("catalog").style.display = "none";
  document.getElementById("cart").style.display = "block";

  // Navigation tugmalarini yangilash
  updateNavigation();

  // Savatchani ko'rsatish
  displayCart();
}

// Profil ko'rsatish
function showProfile() {
  // Profil sahifasini ko'rsatish
  tg.showAlert("Profil sahifasi tez orada qo'shiladi!");
}

// Navigation tugmalarini yangilash
function updateNavigation() {
  const navBtns = document.querySelectorAll(".nav-btn");
  navBtns.forEach((btn) => btn.classList.remove("active"));

  if (currentView === "catalog") {
    navBtns[0].classList.add("active");
  } else if (currentView === "cart") {
    navBtns[1].classList.add("active");
  }
}

// Mahsulotlarni ko'rsatish
function displayProducts() {
  const catalog = document.getElementById("catalog");
  catalog.innerHTML = "";

  products.forEach((product) => {
    const productCard = document.createElement("div");
    productCard.className = "product-card";
    productCard.innerHTML = `
            <img src="${product.image}" alt="${
      product.name
    }" class="product-image">
            <h3 class="product-title">${product.name}</h3>
            <div class="product-price">${product.price.toLocaleString()} so'm</div>
            <p class="product-description">${product.description}</p>
            <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                🛒 Savatchaga qo'shish
            </button>
        `;
    catalog.appendChild(productCard);
  });
}

// Savatchaga qo'shish
function addToCart(productId) {
  const product = products.find((p) => p.id === productId);
  if (product) {
    const existingItem = cart.find((item) => item.id === productId);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        ...product,
        quantity: 1,
      });
    }

    updateCartCount();
    tg.showPopup({
      title: "Muvaffaqiyatli!",
      message: `${product.name} savatchaga qo'shildi!`,
      buttons: [
        { text: "Savatchani ko'rish", type: "default" },
        { text: "Davom etish", type: "cancel" },
      ],
    });
  }
}

// Savatchani ko'rsatish
function displayCart() {
  const cartContainer = document.getElementById("cart");

  if (cart.length === 0) {
    cartContainer.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <h3>🛒 Savatcha bo'sh</h3>
                <p>Savatchangizda hali mahsulot yo'q</p>
                <button class="add-to-cart-btn" onclick="showCatalog()">
                    Mahsulotlarni ko'rish
                </button>
            </div>
        `;
    return;
  }

  let cartHTML = "";
  let total = 0;

  cart.forEach((item) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    cartHTML += `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">${item.price.toLocaleString()} so'm x ${
      item.quantity
    }</div>
                </div>
                <button onclick="removeFromCart(${
                  item.id
                })" style="background: #dc3545; color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer;">
                    ❌
                </button>
            </div>
        `;
  });

  cartHTML += `
        <div class="cart-total">
            <div class="total-price">Jami: ${total.toLocaleString()} so'm</div>
            <button class="checkout-btn" onclick="checkout()">
                💳 Buyurtma berish
            </button>
        </div>
    `;

  cartContainer.innerHTML = cartHTML;
}

// Savatchadan olib tashlash
function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  updateCartCount();
  displayCart();
}

// Savatcha sonini yangilash
function updateCartCount() {
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  // Navigation tugmasida son ko'rsatish mumkin
}

// Buyurtma berish
function checkout() {
  if (cart.length === 0) {
    tg.showAlert("Savatcha bo'sh!");
    return;
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  tg.showPopup({
    title: "Buyurtma berish",
    message: `Jami summa: ${total.toLocaleString()} so'm\n\nBuyurtmani tasdiqlaysizmi?`,
    buttons: [
      { text: "Ha, tasdiqlayman", type: "default" },
      { text: "Bekor qilish", type: "cancel" },
    ],
  });
}

// Telegram Web App'ni yopish
function closeApp() {
  tg.close();
}
