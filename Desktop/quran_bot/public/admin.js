// Admin Panel JavaScript

// Telegram Web App'ni ishga tushirish
let tg = window.Telegram.WebApp;

// Web App'ni to'liq ekran qilish
tg.expand();

// API base URL
const API_BASE_URL = "http://localhost:3002/api";

// Asosiy ma'lumotlar
let currentTab = "products";
let products = [];
let categories = [];
let pendingProducts = [];

// Sahifa yuklanganda
document.addEventListener("DOMContentLoaded", async function () {
  console.log("Admin panel yuklandi");

  // Statistikalarni yuklash
  await loadStats();

  // Kategoriyalarni yuklash
  await loadCategories();

  // Mahsulotlarni yuklash
  await loadProducts();

  // Ko'rib chiqilishi kerak mahsulotlarni yuklash
  await loadPendingProducts();

  // Form submit event'larini o'rnatish
  setupFormEvents();
});

// Statistikalarni yuklash
async function loadStats() {
  try {
    // Mahsulotlar soni
    const productsResponse = await fetch(`${API_BASE_URL}/products`);
    const allProducts = await productsResponse.json();

    document.getElementById("totalProducts").textContent = allProducts.length;
    document.getElementById("activeProducts").textContent = allProducts.filter(
      (p) => p.isActive
    ).length;
    document.getElementById("pendingProducts").textContent = allProducts.filter(
      (p) => p.needsReview
    ).length;

    // Kategoriyalar soni
    const categoriesResponse = await fetch(`${API_BASE_URL}/categories`);
    const allCategories = await categoriesResponse.json();
    document.getElementById("totalCategories").textContent =
      allCategories.length;
  } catch (error) {
    console.error("Statistikani yuklashda xatolik:", error);
  }
}

// Kategoriyalarni yuklash
async function loadCategories() {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`);
    categories = await response.json();

    // Kategoriya filter'ini to'ldirish
    const categoryFilter = document.getElementById("categoryFilter");
    categoryFilter.innerHTML = '<option value="">Barcha kategoriyalar</option>';

    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category._id;
      option.textContent = category.name;
      categoryFilter.appendChild(option);
    });

    // Mahsulot qo'shish formadagi kategoriya select'ini to'ldirish
    const productCategory = document.getElementById("productCategory");
    productCategory.innerHTML = '<option value="">Kategoriya tanlang</option>';

    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category._id;
      option.textContent = category.name;
      productCategory.appendChild(option);
    });

    // Kategoriyalar ro'yxatini ko'rsatish
    displayCategories();
  } catch (error) {
    console.error("Kategoriyalarni yuklashda xatolik:", error);
  }
}

// Mahsulotlarni yuklash
async function loadProducts() {
  try {
    const response = await fetch(`${API_BASE_URL}/products`);
    products = await response.json();
    displayProducts(products);
  } catch (error) {
    console.error("Mahsulotlarni yuklashda xatolik:", error);
  }
}

// Ko'rib chiqilishi kerak mahsulotlarni yuklash
async function loadPendingProducts() {
  try {
    const response = await fetch(`${API_BASE_URL}/products?needsReview=true`);
    pendingProducts = await response.json();
    displayPendingProducts(pendingProducts);
  } catch (error) {
    console.error(
      "Ko'rib chiqilishi kerak mahsulotlarni yuklashda xatolik:",
      error
    );
  }
}

// Mahsulotlarni ko'rsatish
function displayProducts(productsToShow) {
  const grid = document.getElementById("productsGrid");
  grid.innerHTML = "";

  if (productsToShow.length === 0) {
    grid.innerHTML = "<p>Mahsulot topilmadi</p>";
    return;
  }

  productsToShow.forEach((product) => {
    const card = document.createElement("div");
    card.className = "product-card";

    card.innerHTML = `
            <img src="${
              product.image ||
              "https://via.placeholder.com/300x200?text=No+Image"
            }" 
                 alt="${product.name}" class="product-image">
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-price">${product.price?.toLocaleString()} so'm</div>
                <div class="product-actions">
                    <button class="btn-edit" onclick="editProduct('${
                      product._id
                    }')">✏️ Tahrirlash</button>
                    <button class="btn-delete" onclick="deleteProduct('${
                      product._id
                    }')">🗑️ O'chirish</button>
                </div>
            </div>
        `;

    grid.appendChild(card);
  });
}

// Ko'rib chiqilishi kerak mahsulotlarni ko'rsatish
function displayPendingProducts(pendingProductsToShow) {
  const grid = document.getElementById("pendingProductsGrid");
  if (!grid) return;

  grid.innerHTML = "";

  if (pendingProductsToShow.length === 0) {
    grid.innerHTML = "<p>Ko'rib chiqilishi kerak mahsulot yo'q</p>";
    return;
  }

  pendingProductsToShow.forEach((product) => {
    const card = document.createElement("div");
    card.className = "product-card";

    card.innerHTML = `
      <img src="${
        product.image || "https://via.placeholder.com/300x200?text=No+Image"
      }" 
           alt="${product.name}" class="product-image">
      <div class="product-info">
        <div class="product-name">${product.name}</div>
        <div class="product-price">${product.price?.toLocaleString()} so'm</div>
        <div class="product-actions">
          <button class="btn-edit" onclick="approveProduct('${
            product._id
          }')">✅ Tasdiqlash</button>
          <button class="btn-edit" onclick="editPendingProduct('${
            product._id
          }')">✏️ Tahrirlash</button>
          <button class="btn-delete" onclick="rejectProduct('${
            product._id
          }')">❌ Rad etish</button>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });
}

// Kategoriyalarni ko'rsatish
function displayCategories() {
  const list = document.getElementById("categoriesList");
  list.innerHTML = "";

  if (categories.length === 0) {
    list.innerHTML = "<p>Kategoriya topilmadi</p>";
    return;
  }

  categories.forEach((category) => {
    const item = document.createElement("div");
    item.className = "product-card";

    item.innerHTML = `
            <div class="product-info">
                <div class="product-name">${category.name}</div>
                <div class="product-actions">
                    <button class="btn-edit" onclick="editCategory('${category._id}')">✏️ Tahrirlash</button>
                    <button class="btn-delete" onclick="deleteCategory('${category._id}')">🗑️ O'chirish</button>
                </div>
            </div>
        `;

    list.appendChild(item);
  });
}

// Tab ko'rsatish
function showTab(tabName) {
  // Barcha tab'larni yashirish
  document.querySelectorAll(".admin-content").forEach((tab) => {
    tab.classList.add("hidden");
  });

  // Barcha tab button'larini inactive qilish
  document.querySelectorAll(".admin-tab").forEach((tab) => {
    tab.classList.remove("active");
  });

  // Tanlangan tab'ni ko'rsatish
  document.getElementById(`${tabName}-tab`).classList.remove("hidden");

  // Tanlangan tab button'ini active qilish
  event.target.classList.add("active");

  currentTab = tabName;

  // Tab o'zgarganida ma'lumotlarni yangilash
  if (tabName === "products") {
    loadProducts();
  } else if (tabName === "categories") {
    loadCategories();
  } else if (tabName === "pending") {
    loadPendingProducts();
  }
}

// Mahsulot qidirish
function searchProducts() {
  const searchTerm = document
    .getElementById("productSearch")
    .value.toLowerCase();
  const categoryFilter = document.getElementById("categoryFilter").value;

  let filteredProducts = products;

  // Kategoriya bo'yicha filtrlash
  if (categoryFilter) {
    filteredProducts = filteredProducts.filter(
      (product) => product.categoryId === categoryFilter
    );
  }

  // Qidiruv so'zi bo'yicha filtrlash
  if (searchTerm) {
    filteredProducts = filteredProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
    );
  }

  displayProducts(filteredProducts);
}

// Ko'rib chiqilishi kerak mahsulotlarni qidirish
function searchPendingProducts() {
  const searchTerm = document
    .getElementById("pendingSearch")
    .value.toLowerCase();
  const categoryFilter = document.getElementById("pendingCategoryFilter").value;

  let filteredProducts = pendingProducts;

  // Kategoriya bo'yicha filtrlash
  if (categoryFilter) {
    filteredProducts = filteredProducts.filter(
      (product) => product.categoryId === categoryFilter
    );
  }

  // Qidiruv so'zi bo'yicha filtrlash
  if (searchTerm) {
    filteredProducts = filteredProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
    );
  }

  displayPendingProducts(filteredProducts);
}

// Form event'larini o'rnatish
function setupFormEvents() {
  const addProductForm = document.getElementById("addProductForm");
  if (addProductForm) {
    addProductForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      await submitProduct();
    });
  }
}

// Mahsulot qo'shish
async function submitProduct() {
  try {
    const productData = {
      name: document.getElementById("productName").value,
      description: document.getElementById("productDescription").value,
      price: parseInt(document.getElementById("productPrice").value),
      categoryId: document.getElementById("productCategory").value || null,
      image: document.getElementById("productImage").value || null,
      stock: parseInt(document.getElementById("productStock").value) || 1,
    };

    // Web App orqali ma'lumot yuborish
    const data = {
      action: "admin_action",
      command: "add_product",
      productData: productData,
    };

    tg.sendData(JSON.stringify(data));

    // Form'ni tozalash
    document.getElementById("addProductForm").reset();

    // Mahsulotlar tab'iga o'tish
    showTab("products");

    // Ma'lumotlarni yangilash
    await loadProducts();
    await loadStats();

    showSuccessMessage("Mahsulot muvaffaqiyatli qo'shildi!");
  } catch (error) {
    console.error("Mahsulot qo'shishda xatolik:", error);
    showErrorMessage("Mahsulot qo'shishda xatolik yuz berdi");
  }
}

// Mahsulotni tahrirlash
async function editProduct(productId) {
  const product = products.find((p) => p._id === productId);
  if (!product) return;

  // Tahrirlash form'ini ko'rsatish
  showTab("add-product");

  // Form'ni to'ldirish
  document.getElementById("productName").value = product.name;
  document.getElementById("productDescription").value = product.description;
  document.getElementById("productPrice").value = product.price;
  document.getElementById("productCategory").value = product.categoryId || "";
  document.getElementById("productImage").value = product.image || "";
  document.getElementById("productStock").value = product.stock || 1;

  // Form submit event'ini o'zgartirish
  const form = document.getElementById("addProductForm");
  form.onsubmit = async (e) => {
    e.preventDefault();
    await updateProduct(productId);
  };

  // Button matnini o'zgartirish
  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.textContent = "💾 Mahsulotni yangilash";
}

// Mahsulotni yangilash
async function updateProduct(productId) {
  try {
    const productData = {
      name: document.getElementById("productName").value,
      description: document.getElementById("productDescription").value,
      price: parseInt(document.getElementById("productPrice").value),
      categoryId: document.getElementById("productCategory").value || null,
      image: document.getElementById("productImage").value || null,
      stock: parseInt(document.getElementById("productStock").value) || 1,
    };

    const data = {
      action: "admin_action",
      command: "edit_product",
      productId: productId,
      productData: productData,
    };

    tg.sendData(JSON.stringify(data));

    // Form'ni tozalash va mahsulotlar tab'iga qaytish
    document.getElementById("addProductForm").reset();
    showTab("products");

    // Ma'lumotlarni yangilash
    await loadProducts();
    await loadStats();

    showSuccessMessage("Mahsulot muvaffaqiyatli yangilandi!");
  } catch (error) {
    console.error("Mahsulotni yangilashda xatolik:", error);
    showErrorMessage("Mahsulotni yangilashda xatolik yuz berdi");
  }
}

// Mahsulotni o'chirish
async function deleteProduct(productId) {
  if (!confirm("Bu mahsulotni o'chirishni xohlaysizmi?")) return;

  try {
    const data = {
      action: "admin_action",
      command: "delete_product",
      productId: productId,
    };

    tg.sendData(JSON.stringify(data));

    // Ma'lumotlarni yangilash
    await loadProducts();
    await loadStats();

    showSuccessMessage("Mahsulot muvaffaqiyatli o'chirildi!");
  } catch (error) {
    console.error("Mahsulotni o'chirishda xatolik:", error);
    showErrorMessage("Mahsulotni o'chirishda xatolik yuz berdi");
  }
}

// Kategoriya qo'shish
async function addCategory() {
  const categoryName = document.getElementById("categorySearch").value.trim();
  if (!categoryName) {
    showErrorMessage("Kategoriya nomini kiriting");
    return;
  }

  try {
    const data = {
      action: "admin_action",
      command: "add_category",
      categoryData: { name: categoryName },
    };

    tg.sendData(JSON.stringify(data));

    // Input'ni tozalash
    document.getElementById("categorySearch").value = "";

    // Ma'lumotlarni yangilash
    await loadCategories();
    await loadStats();

    showSuccessMessage("Kategoriya muvaffaqiyatli qo'shildi!");
  } catch (error) {
    console.error("Kategoriya qo'shishda xatolik:", error);
    showErrorMessage("Kategoriya qo'shishda xatolik yuz berdi");
  }
}

// Kategoriyani tahrirlash
async function editCategory(categoryId) {
  const category = categories.find((c) => c._id === categoryId);
  if (!category) return;

  const newName = prompt("Yangi kategoriya nomi:", category.name);
  if (!newName || newName.trim() === "") return;

  try {
    const data = {
      action: "admin_action",
      command: "edit_category",
      categoryId: categoryId,
      categoryData: { name: newName.trim() },
    };

    tg.sendData(JSON.stringify(data));

    // Ma'lumotlarni yangilash
    await loadCategories();
    await loadStats();

    showSuccessMessage("Kategoriya muvaffaqiyatli yangilandi!");
  } catch (error) {
    console.error("Kategoriyani yangilashda xatolik:", error);
    showErrorMessage("Kategoriyani yangilashda xatolik yuz berdi");
  }
}

// Mahsulotni tasdiqlash
async function approveProduct(productId) {
  if (!confirm("Bu mahsulotni tasdiqlashni xohlaysizmi?")) return;

  try {
    const data = {
      action: "admin_action",
      command: "approve_product",
      productId: productId,
    };

    tg.sendData(JSON.stringify(data));

    // Ma'lumotlarni yangilash
    await loadPendingProducts();
    await loadProducts();
    await loadStats();

    showSuccessMessage(
      "Mahsulot muvaffaqiyatli tasdiqlandi va Web App'ga qo'shildi!"
    );
  } catch (error) {
    console.error("Mahsulotni tasdiqlashda xatolik:", error);
    showErrorMessage("Mahsulotni tasdiqlashda xatolik yuz berdi");
  }
}

// Mahsulotni rad etish
async function rejectProduct(productId) {
  const reason = prompt("Rad etish sababini kiriting:");
  if (!reason || reason.trim() === "") return;

  try {
    const data = {
      action: "admin_action",
      command: "reject_product",
      productId: productId,
      reason: reason.trim(),
    };

    tg.sendData(JSON.stringify(data));

    // Ma'lumotlarni yangilash
    await loadPendingProducts();
    await loadStats();

    showSuccessMessage("Mahsulot rad etildi!");
  } catch (error) {
    console.error("Mahsulotni rad etishda xatolik:", error);
    showErrorMessage("Mahsulotni rad etishda xatolik yuz berdi");
  }
}

// Ko'rib chiqilishi kerak mahsulotni tahrirlash
async function editPendingProduct(productId) {
  const product = pendingProducts.find((p) => p._id === productId);
  if (!product) return;

  // Tahrirlash form'ini ko'rsatish
  showTab("add-product");

  // Form'ni to'ldirish
  document.getElementById("productName").value = product.name;
  document.getElementById("productDescription").value = product.description;
  document.getElementById("productPrice").value = product.price;
  document.getElementById("productCategory").value = product.categoryId || "";
  document.getElementById("productImage").value = product.image || "";
  document.getElementById("productStock").value = product.stock || 1;

  // Form submit event'ini o'zgartirish
  const form = document.getElementById("addProductForm");
  form.onsubmit = async (e) => {
    e.preventDefault();
    await updatePendingProduct(productId);
  };

  // Button matnini o'zgartirish
  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.textContent = "💾 Mahsulotni yangilash va tasdiqlash";
}

// Ko'rib chiqilishi kerak mahsulotni yangilash
async function updatePendingProduct(productId) {
  try {
    const productData = {
      name: document.getElementById("productName").value,
      description: document.getElementById("productDescription").value,
      price: parseInt(document.getElementById("productPrice").value),
      categoryId: document.getElementById("productCategory").value || null,
      image: document.getElementById("productImage").value || null,
      stock: parseInt(document.getElementById("productStock").value) || 1,
    };

    const data = {
      action: "admin_action",
      command: "update_pending_product",
      productId: productId,
      productData: productData,
    };

    tg.sendData(JSON.stringify(data));

    // Form'ni tozalash va ko'rib chiqilishi kerak tab'iga qaytish
    document.getElementById("addProductForm").reset();
    showTab("pending");

    // Ma'lumotlarni yangilash
    await loadPendingProducts();
    await loadProducts();
    await loadStats();

    showSuccessMessage("Mahsulot muvaffaqiyatli yangilandi va tasdiqlandi!");
  } catch (error) {
    console.error("Mahsulotni yangilashda xatolik:", error);
    showErrorMessage("Mahsulotni yangilashda xatolik yuz berdi");
  }
}

// Kategoriyani o'chirish
async function deleteCategory(categoryId) {
  if (!confirm("Bu kategoriyani o'chirishni xohlaysizmi?")) return;

  try {
    const data = {
      action: "admin_action",
      command: "delete_category",
      categoryId: categoryId,
    };

    tg.sendData(JSON.stringify(data));

    // Ma'lumotlarni yangilash
    await loadCategories();
    await loadStats();

    showSuccessMessage("Kategoriya muvaffaqiyatli o'chirildi!");
  } catch (error) {
    console.error("Kategoriyani o'chirishda xatolik:", error);
    showErrorMessage("Kategoriyani o'chirishda xatolik yuz berdi");
  }
}

// Xabar ko'rsatish funksiyalari
function showSuccessMessage(message) {
  // Telegram Web App notification
  tg.showAlert(message);
}

function showErrorMessage(message) {
  // Telegram Web App notification
  tg.showAlert(message);
}

// Web App'dan kelgan javoblarni tinglash
tg.onEvent("mainButtonClicked", function () {
  console.log("Main button clicked");
});

// Xatolik yuz berganda
tg.onEvent("error", function (error) {
  console.error("Web App error:", error);
  showErrorMessage("Xatolik yuz berdi: " + error.message);
});
