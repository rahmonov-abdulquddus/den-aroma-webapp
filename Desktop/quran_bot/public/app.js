// Telegram Web App'ni ishga tushirish
let tg = window.Telegram.WebApp;

// Web App'ni to'liq ekran qilish
tg.expand();

// Asosiy ma'lumotlar
let currentView = "catalog";
let cart = [];
let selectedLocation = "Toshkent";
let currentCategory = "all";

// Mahsulotlar ma'lumotlari
let products = [
  {
    id: 1,
    name: "Aroma Oqbilol - Premium Gold",
    price: 250000,
    originalPrice: 300000,
    description: "Eng yuqori sifatli, tabiiy ingredientlar bilan tayyorlangan premium aroma oqbilol. Uzun muddatli ta'm va sifatli ingredientlar.",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
    category: "premium",
    rating: 5,
    reviews: 128,
    inStock: true,
    discount: 15,
    tags: ["premium", "tabiiy", "uzun muddatli"]
  },
  {
    id: 2,
    name: "Aroma Oqbilol - Classic",
    price: 180000,
    originalPrice: 220000,
    description: "Klassik ta'm va sifatli ingredientlar bilan tayyorlangan aroma oqbilol. An'anaviy retsept bo'yicha.",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
    category: "classic",
    rating: 4,
    reviews: 89,
    inStock: true,
    discount: 18,
    tags: ["klassik", "an'anaviy", "sifatli"]
  },
  {
    id: 3,
    name: "Aroma Oqbilol - Deluxe",
    price: 320000,
    originalPrice: 400000,
    description: "Eksklyuziv dizayn va eng yaxshi ingredientlar bilan tayyorlangan deluxe versiya. Cheklangan nashr.",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
    category: "deluxe",
    rating: 5,
    reviews: 67,
    inStock: true,
    discount: 20,
    tags: ["eksklyuziv", "deluxe", "cheklangan nashr"]
  },
  {
    id: 4,
    name: "Aroma Oqbilol - Organic",
    price: 280000,
    originalPrice: 320000,
    description: "100% organik ingredientlar bilan tayyorlangan tabiiy aroma oqbilol. Sog'liq uchun foydali.",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
    category: "organic",
    rating: 5,
    reviews: 156,
    inStock: true,
    discount: 12,
    tags: ["organik", "tabiiy", "sog'liq"]
  },
  {
    id: 5,
    name: "Aroma Oqbilol - Limited Edition",
    price: 450000,
    originalPrice: 600000,
    description: "Cheklangan nashr, maxsus dizayn va eng yaxshi ingredientlar bilan tayyorlangan eksklyuziv versiya.",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
    category: "limited",
    rating: 5,
    reviews: 34,
    inStock: true,
    discount: 25,
    tags: ["cheklangan nashr", "eksklyuziv", "maxsus"]
  }
];

// Kategoriyalar ma'lumotlari
let categories = {
  all: { name: "Barcha mahsulotlar", icon: "fas fa-th-large" },
  premium: { name: "Premium", icon: "fas fa-crown" },
  classic: { name: "Klassik", icon: "fas fa-star" },
  deluxe: { name: "Deluxe", icon: "fas fa-gem" },
  organic: { name: "Organik", icon: "fas fa-leaf" },
  limited: { name: "Cheklangan nashr", icon: "fas fa-fire" }
};

// Sahifani yuklash
document.addEventListener("DOMContentLoaded", function () {
  showCatalog();
  updateCartCount();
  setupSearch();
  setupLocationSelector();
  setupTimeUpdate();
});

// Vaqtni yangilash
function setupTimeUpdate() {
  const timeElement = document.querySelector('.time');
  if (timeElement) {
    setInterval(() => {
      const now = new Date();
      const timeString = now.toLocaleTimeString('uz-UZ', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      timeElement.textContent = timeString;
    }, 1000);
  }
}

// Lokatsiya tanlash
function setupLocationSelector() {
  const locationInfo = document.querySelector('.location-info');
  if (locationInfo) {
    locationInfo.addEventListener('click', () => {
      showLocationModal();
    });
  }
}

// Lokatsiya modal'ini ko'rsatish
function showLocationModal() {
  const modal = document.getElementById('locationModal');
  if (modal) {
    modal.style.display = 'flex';
  }
}

// Lokatsiya modal'ini yopish
function closeLocationModal() {
  const modal = document.getElementById('locationModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// Lokatsiya tanlash
function selectLocation(type) {
  switch(type) {
    case 'current':
      // GPS orqali hozirgi joylashuv
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            selectedLocation = "Hozirgi joylashuv";
            updateLocationDisplay();
            showSuccessMessage("Lokatsiya muvaffaqiyatli tanlandi!");
          },
          (error) => {
            showErrorMessage("Lokatsiya olinmadi. Qo'lda kiriting.");
          }
        );
      }
      break;
    case 'manual':
      // Qo'lda kiritish
      const newLocation = prompt("Shahar nomini kiriting:");
      if (newLocation) {
        selectedLocation = newLocation;
        updateLocationDisplay();
        showSuccessMessage("Lokatsiya yangilandi!");
      }
      break;
    case 'saved':
      // Saqlangan manzillar
      showSavedLocations();
      break;
  }
  closeLocationModal();
}

// Saqlangan manzillarni ko'rsatish
function showSavedLocations() {
  const savedLocations = ["Toshkent", "Samarqand", "Buxoro", "Andijon"];
  const location = prompt("Saqlangan manzillardan tanlang:\n" + savedLocations.join("\n"));
  if (savedLocations.includes(location)) {
    selectedLocation = location;
    updateLocationDisplay();
    showSuccessMessage("Lokatsiya tanlandi!");
  }
}

// Lokatsiya ko'rsatishni yangilash
function updateLocationDisplay() {
  const cityElement = document.querySelector('.city');
  if (cityElement) {
    cityElement.textContent = selectedLocation;
  }
}

// Qidiruv funksiyasini sozlash
function setupSearch() {
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", function (e) {
      const searchTerm = e.target.value.toLowerCase();
      filterProducts(searchTerm);
    });
  }
}

// Mahsulotlarni filtrlash
function filterProducts(searchTerm) {
  let filteredProducts = products;
  
  // Kategoriya bo'yicha filtrlash
  if (currentCategory !== "all") {
    filteredProducts = filteredProducts.filter(product => product.category === currentCategory);
  }
  
  // Qidiruv so'zi bo'yicha filtrlash
  if (searchTerm) {
    filteredProducts = filteredProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }
  
  displayProducts(filteredProducts);
}

// Kategoriya ko'rsatish
function showCategory(category) {
  currentCategory = category;
  currentView = "catalog";
  
  // Navigation yangilash
  updateNavigation();
  
  // Mahsulotlarni ko'rsatish
  if (category === "all") {
    displayProducts(products);
  } else {
    const categoryProducts = products.filter(product => product.category === category);
    displayProducts(categoryProducts);
  }
  
  // Katalog ko'rsatish
  document.getElementById("catalog").style.display = "block";
  document.getElementById("cart").style.display = "none";
  document.getElementById("profile").style.display = "none";
}

// Katalog ko'rsatish
function showCatalog() {
  currentView = "catalog";
  currentCategory = "all";
  
  document.getElementById("catalog").style.display = "block";
  document.getElementById("cart").style.display = "none";
  document.getElementById("profile").style.display = "none";
  
  updateNavigation();
  displayProducts(products);
}

// Savatcha ko'rsatish
function showCart() {
  currentView = "cart";
  
  document.getElementById("catalog").style.display = "none";
  document.getElementById("cart").style.display = "block";
  document.getElementById("profile").style.display = "none";
  
  updateNavigation();
  displayCart();
}

// Tezkor buyurtma
function showQuickOrder() {
  if (cart.length === 0) {
    showErrorMessage("Tezkor buyurtma uchun savatchaga mahsulot qo'shing!");
    return;
  }
  
  tg.showPopup({
    title: "Tezkor buyurtma",
    message: "Tezkor buyurtma tizimi tez orada qo'shiladi!",
    buttons: [
      { text: "Tushunarli", type: "default" }
    ]
  });
}

// Profil ko'rsatish
function showProfile() {
  currentView = "profile";
  
  document.getElementById("catalog").style.display = "none";
  document.getElementById("cart").style.display = "none";
  document.getElementById("profile").style.display = "block";
  
  updateNavigation();
  displayProfile();
}

// Navigation tugmalarini yangilash
function updateNavigation() {
  const navBtns = document.querySelectorAll(".nav-btn");
  navBtns.forEach((btn) => btn.classList.remove("active"));
  
  if (currentView === "catalog") {
    navBtns[0].classList.add("active"); // Bosh sahifa
  } else if (currentView === "cart") {
    navBtns[2].classList.add("active"); // Savat
  } else if (currentView === "profile") {
    navBtns[4].classList.add("active"); // Profil
  }
}

// Mahsulotlarni ko'rsatish
function displayProducts(productsToShow = products) {
  const catalog = document.getElementById("catalog");
  catalog.innerHTML = "";
  
  if (productsToShow.length === 0) {
    catalog.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-search"></i>
        <h3>Mahsulot topilmadi</h3>
        <p>Qidiruv so'zini o'zgartiring yoki boshqa kategoriyani tanlang.</p>
        <button class="empty-state-btn" onclick="showCatalog()">
          <i class="fas fa-home"></i>
          Bosh sahifaga qaytish
        </button>
      </div>
    `;
    return;
  }
  
  productsToShow.forEach((product) => {
    const productCard = document.createElement("div");
    productCard.className = "product-card";
    
    const stars = "★".repeat(product.rating) + "☆".repeat(5 - product.rating);
    
    productCard.innerHTML = `
      <img src="${product.image}" alt="${product.name}" class="product-image">
      <div class="product-header">
        <h3 class="product-title">${product.name}</h3>
        <span class="product-category">${categories[product.category]?.name || product.category}</span>
      </div>
      <div class="product-rating">
        <div class="stars">${stars}</div>
        <span class="rating-text">${product.rating} (${product.reviews} ta baho)</span>
      </div>
      <div class="product-price">
        <span class="current-price">${product.price.toLocaleString()} so'm</span>
        ${product.discount > 0 ? `<span class="original-price">${product.originalPrice.toLocaleString()} so'm</span>` : ""}
        ${product.discount > 0 ? `<span class="discount-badge">-${product.discount}%</span>` : ""}
      </div>
      <p class="product-description">${product.description}</p>
      <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
        <i class="fas fa-shopping-cart"></i>
        Savatchaga qo'shish
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
    showSuccessMessage(`${product.name} savatchaga qo'shildi!`);
  }
}

// Savatchani ko'rsatish
function displayCart() {
  const cartContainer = document.getElementById("cart");
  
  if (cart.length === 0) {
    cartContainer.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-shopping-cart"></i>
        <h3>Savatcha bo'sh</h3>
        <p>Mahsulot qo'shish uchun katalogga o'ting.</p>
        <button class="empty-state-btn" onclick="showCatalog()">
          <i class="fas fa-th-large"></i>
          Katalogga o'tish
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
          <div class="cart-item-price">${item.price.toLocaleString()} so'm</div>
          <div class="quantity-controls">
            <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
            <span class="quantity-display">${item.quantity}</span>
            <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
          </div>
        </div>
        <button class="remove-btn" onclick="removeFromCart(${item.id})">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
  });
  
  cartHTML += `
    <div class="cart-total">
      <div class="total-price">Jami: ${total.toLocaleString()} so'm</div>
      <button class="checkout-btn" onclick="checkout()">
        <i class="fas fa-credit-card"></i>
        Naqd pul bilan to'lov
      </button>
    </div>
  `;
  
  cartContainer.innerHTML = cartHTML;
}

// Savatcha miqdorini yangilash
function updateQuantity(productId, change) {
  const item = cart.find((item) => item.id === productId);
  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      removeFromCart(productId);
    } else {
      updateCartCount();
      displayCart();
    }
  }
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
  const cartBadge = document.getElementById("cartBadge");
  if (cartBadge) {
    cartBadge.textContent = cartCount;
    cartBadge.style.display = cartCount > 0 ? "flex" : "none";
  }
}

// Profil sahifasini ko'rsatish
function displayProfile() {
  const profileContainer = document.getElementById("profile");
  
  const totalOrders = cart.length > 0 ? 1 : 0;
  const totalSpent = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  profileContainer.innerHTML = `
    <div class="profile-header">
      <div class="profile-avatar">
        <i class="fas fa-user"></i>
      </div>
      <h3 class="profile-name">Foydalanuvchi</h3>
      <p class="profile-email">${selectedLocation}</p>
    </div>
    
    <div class="profile-stats">
      <div class="stat-card">
        <div class="stat-number">${cart.length}</div>
        <div class="stat-label">Mahsulotlar</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${totalOrders}</div>
        <div class="stat-label">Buyurtmalar</div>
      </div>
    </div>
    
    <div class="profile-actions">
      <button class="profile-btn" onclick="showOrders()">
        <i class="fas fa-list"></i>
        Buyurtmalar tarixi
      </button>
      <button class="profile-btn" onclick="showSettings()">
        <i class="fas fa-cog"></i>
        Sozlamalar
      </button>
      <button class="profile-btn" onclick="showHelp()">
        <i class="fas fa-question-circle"></i>
        Yordam
      </button>
      <button class="profile-btn" onclick="closeApp()">
        <i class="fas fa-times"></i>
        Chiqish
      </button>
    </div>
  `;
}

// Buyurtma berish
function checkout() {
  if (cart.length === 0) {
    showErrorMessage("Savatcha bo'sh!");
    return;
  }
  
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  tg.showPopup({
    title: "Buyurtma berish",
    message: `Jami summa: ${total.toLocaleString()} so'm\n\nTo'lov: Naqd pul bilan\nDastavchi kelganda to'lov qilishingiz mumkin.\n\nBuyurtmani tasdiqlaysizmi?`,
    buttons: [
      { text: "Ha, tasdiqlayman", type: "default" },
      { text: "Bekor qilish", type: "cancel" }
    ]
  });
}

// Xabar ko'rsatish funksiyalari
function showSuccessMessage(message) {
  tg.showPopup({
    title: "Muvaffaqiyatli!",
    message: message,
    buttons: [
      { text: "Savatchani ko'rish", type: "default" },
      { text: "Davom etish", type: "cancel" }
    ]
  });
}

function showErrorMessage(message) {
  tg.showAlert(message);
}

// Profil funksiyalari
function showOrders() {
  tg.showAlert("Buyurtmalar tarixi tez orada qo'shiladi!");
}

function showSettings() {
  tg.showAlert("Sozlamalar tez orada qo'shiladi!");
}

function showHelp() {
  tg.showAlert("Yordam sahifasi tez orada qo'shiladi!");
}

// Telegram Web App'ni yopish
function closeApp() {
  tg.close();
}
