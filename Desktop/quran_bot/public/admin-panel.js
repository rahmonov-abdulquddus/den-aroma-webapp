// ===== ADMIN PANEL - JAVASCRIPT =====

// Telegram Web App'ni ishga tushirish
let tg;
let categories = [];
let products = [];

// API URL'lar
const API_BASE_URL = "https://den-aroma-webapp-1.vercel.app/api";
const WEB_APP_URL = "https://den-aroma-webapp-1.vercel.app";

// Sahifa yuklanganda
document.addEventListener("DOMContentLoaded", async function () {
  // Telegram Web App'ni ishga tushirish
  tg = window.Telegram.WebApp;
  tg.ready();
  tg.expand();

  // Ma'lumotlarni yuklash
  await loadStats();
  await loadCategories();
  await loadProducts();
  await loadPendingProducts();

  // Form submit event'larini o'rnatish
  setupFormEvents();

  // Dashboard'ni ko'rsatish
  showTab("dashboard");
});

// Statistikalarni yuklash
async function loadStats() {
  try {
    // Jami mahsulotlar
    const productsResponse = await fetch(`${API_BASE_URL}/products`);
    const allProducts = await productsResponse.json();

    // Ko'rib chiqilishi kerak mahsulotlar
    const pendingResponse = await fetch(
      `${API_BASE_URL}/products?needsReview=true`
    );
    const pending = await pendingResponse.json();

    // Kategoriyalar
    const categoriesResponse = await fetch(`${API_BASE_URL}/categories`);
    const allCategories = await categoriesResponse.json();

    // Statistikalarni ko'rsatish
    document.getElementById("totalProducts").textContent =
      allProducts.length || 0;
    document.getElementById("pendingProducts").textContent =
      pending.length || 0;
    document.getElementById("totalCategories").textContent =
      allCategories.length || 0;
    document.getElementById("activeProducts").textContent =
      allProducts.filter((p) => p.isActive).length || 0;

    // Dashboard statistikasi
    document.getElementById("todayOrders").textContent = "0"; // Hali implement qilinmagan
    document.getElementById("monthlyRevenue").textContent = "0 so'm"; // Hali implement qilinmagan
    document.getElementById("totalUsers").textContent = "0"; // Hali implement qilinmagan
    document.getElementById("systemStatus").textContent = "✅";
  } catch (error) {
    console.error("Statistikani yuklashda xatolik:", error);
  }
}

// Kategoriyalarni yuklash
async function loadCategories() {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`);
    categories = await response.json();

    // Kategoriya filter'larini to'ldirish
    const categoryFilter = document.getElementById("categoryFilter");
    const pendingCategoryFilter = document.getElementById(
      "pendingCategoryFilter"
    );

    if (categoryFilter) {
      categoryFilter.innerHTML =
        '<option value="">Barcha kategoriyalar</option>';
      categories.forEach((category) => {
        const option = document.createElement("option");
        option.value = category._id;
        option.textContent = category.name;
        categoryFilter.appendChild(option);
      });
    }

    if (pendingCategoryFilter) {
      pendingCategoryFilter.innerHTML =
        '<option value="">Barcha kategoriyalar</option>';
      categories.forEach((category) => {
        const option = document.createElement("option");
        option.value = category._id;
        option.textContent = category.name;
        pendingCategoryFilter.appendChild(option);
      });
    }

    // Kategoriya select'ini to'ldirish
    const productCategory = document.getElementById("productCategory");
    if (productCategory) {
      productCategory.innerHTML =
        '<option value="">Kategoriyani tanlang</option>';
      categories.forEach((category) => {
        const option = document.createElement("option");
        option.value = category._id;
        option.textContent = category.name;
        option.appendChild(document.createTextNode(category.name));
      });
    }
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
    const pendingProducts = await response.json();
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
  const container = document.getElementById("productsContainer");
  if (!container) return;

  container.innerHTML = "";

  if (productsToShow.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="icon">📦</div>
        <h3>Mahsulot topilmadi</h3>
        <p>Hali hech qanday mahsulot qo'shilmagan</p>
      </div>
    `;
    return;
  }

  const table = document.createElement("table");
  table.className = "data-table";

  table.innerHTML = `
    <thead>
      <tr>
        <th>Rasm</th>
        <th>Nomi</th>
        <th>Kategoriya</th>
        <th>Narxi</th>
        <th>Holati</th>
        <th>Amallar</th>
      </tr>
    </thead>
    <tbody>
      ${productsToShow
        .map(
          (product) => `
        <tr>
          <td>
            <img src="${
              product.image || "https://via.placeholder.com/50x50?text=No+Image"
            }" 
                 alt="${
                   product.name
                 }" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
          </td>
          <td>${product.name}</td>
          <td>${getCategoryName(product.category)}</td>
          <td>${product.price?.toLocaleString()} so'm</td>
          <td>
            <span class="status-badge ${
              product.needsReview
                ? "status-pending"
                : product.isActive
                ? "status-approved"
                : "status-rejected"
            }">
              ${
                product.needsReview
                  ? "Ko'rib chiqilishi kerak"
                  : product.isActive
                  ? "Faol"
                  : "Rad etilgan"
              }
            </span>
          </td>
          <td>
            <div class="product-actions">
              <button class="btn btn-primary" onclick="viewProduct('${
                product._id
              }')">👁️</button>
              <button class="btn btn-warning" onclick="editProduct('${
                product._id
              }')">✏️</button>
              <button class="btn btn-danger" onclick="deleteProduct('${
                product._id
              }')">🗑️</button>
            </div>
          </td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  `;

  container.appendChild(table);
}

// Ko'rib chiqilishi kerak mahsulotlarni ko'rsatish
function displayPendingProducts(pendingProductsToShow) {
  const container = document.getElementById("pendingProductsContainer");
  if (!container) return;

  container.innerHTML = "";

  if (pendingProductsToShow.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="icon">⏳</div>
        <h3>Ko'rib chiqilishi kerak mahsulot yo'q</h3>
        <p>Barcha mahsulotlar ko'rib chiqilgan</p>
      </div>
    `;
    return;
  }

  const table = document.createElement("table");
  table.className = "data-table";

  table.innerHTML = `
    <thead>
      <tr>
        <th>Rasm</th>
        <th>Nomi</th>
        <th>Kategoriya</th>
        <th>Narxi</th>
        <th>Holati</th>
        <th>Amallar</th>
      </tr>
    </thead>
    <tbody>
      ${pendingProductsToShow
        .map(
          (product) => `
        <tr>
          <td>
            <img src="${
              product.image || "https://via.placeholder.com/50x50?text=No+Image"
            }" 
                 alt="${
                   product.name
                 }" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
          </td>
          <td>${product.name}</td>
          <td>${getCategoryName(product.category)}</td>
          <td>${product.price?.toLocaleString()} so'm</td>
          <td>
            <span class="status-badge status-pending">Ko'rib chiqilishi kerak</span>
          </td>
          <td>
            <div class="product-actions">
              <button class="btn btn-success" onclick="approveProduct('${
                product._id
              }')">✅</button>
              <button class="btn btn-warning" onclick="editPendingProduct('${
                product._id
              }')">✏️</button>
              <button class="btn btn-danger" onclick="rejectProduct('${
                product._id
              }')">❌</button>
            </div>
          </td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  `;

  container.appendChild(table);
}

// Kategoriyalarni ko'rsatish
function displayCategories() {
  const container = document.getElementById("categoriesContainer");
  if (!container) return;

  container.innerHTML = "";

  if (categories.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="icon">🏷️</div>
        <h3>Kategoriya topilmadi</h3>
        <p>Hali hech qanday kategoriya qo'shilmagan</p>
      </div>
    `;
    return;
  }

  const table = document.createElement("table");
  table.className = "data-table";

  table.innerHTML = `
    <thead>
      <tr>
        <th>Nomi</th>
        <th>Tavsif</th>
        <th>Mahsulotlar soni</th>
        <th>Amallar</th>
      </tr>
    </thead>
    <tbody>
      ${categories
        .map(
          (category) => `
        <tr>
          <td>${category.name}</td>
          <td>${category.description || "Tavsif yo'q"}</td>
          <td>${products.filter((p) => p.category === category._id).length}</td>
          <td>
            <div class="product-actions">
              <button class="btn btn-warning" onclick="editCategory('${
                category._id
              }')">✏️</button>
              <button class="btn btn-danger" onclick="deleteCategory('${
                category._id
              }')">🗑️</button>
            </div>
          </td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  `;

  container.appendChild(table);
}

// Tab ko'rsatish
function showTab(tabName) {
  // Barcha tab'larni yashirish
  const tabs = document.querySelectorAll(".tab-content");
  tabs.forEach((tab) => {
    tab.style.display = "none";
  });

  // Barcha tab tugmalarini deaktiv qilish
  const tabButtons = document.querySelectorAll(".tab-btn");
  tabButtons.forEach((btn) => {
    btn.classList.remove("active");
  });

  // Tanlangan tab'ni ko'rsatish
  const selectedTab = document.getElementById(tabName);
  if (selectedTab) {
    selectedTab.style.display = "block";
  }

  // Tanlangan tab tugmasini aktiv qilish
  const selectedButton = document.querySelector(
    `[onclick="showTab('${tabName}')"]`
  );
  if (selectedButton) {
    selectedButton.classList.add("active");
  }
}

// Kategoriya nomini olish
function getCategoryName(categoryId) {
  if (!categoryId) return "Kategoriyasiz";
  const category = categories.find((c) => c._id === categoryId);
  return category ? category.name : "Kategoriyasiz";
}

// Qidiruv va filtrlash
function searchProducts() {
  const searchTerm = document
    .getElementById("productSearch")
    .value.toLowerCase();
  const categoryFilter = document.getElementById("categoryFilter").value;

  let filteredProducts = products;

  if (searchTerm) {
    filteredProducts = filteredProducts.filter((product) =>
      product.name.toLowerCase().includes(searchTerm)
    );
  }

  if (categoryFilter) {
    filteredProducts = filteredProducts.filter(
      (product) => product.category === categoryFilter
    );
  }

  displayProducts(filteredProducts);
}

function searchPendingProducts() {
  const searchTerm = document
    .getElementById("pendingSearch")
    .value.toLowerCase();
  const categoryFilter = document.getElementById("pendingCategoryFilter").value;

  // Ko'rib chiqilishi kerak mahsulotlarni qayta yuklash
  loadPendingProducts();
}

// Form event'larni o'rnatish
function setupFormEvents() {
  // Mahsulot qo'shish formasi
  const addProductForm = document.getElementById("addProductForm");
  if (addProductForm) {
    addProductForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = {
        name: document.getElementById("productName").value,
        description: document.getElementById("productDescription").value,
        price: parseFloat(document.getElementById("productPrice").value),
        category: document.getElementById("productCategory").value,
        image: document.getElementById("productImage").value || "",
        stock: parseInt(document.getElementById("productStock").value) || 0,
        isActive: true,
        needsReview: false,
      };

      try {
        const response = await fetch(`${API_BASE_URL}/products`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          showMessage("✅ Mahsulot muvaffaqiyatli qo'shildi!", "success");
          addProductForm.reset();
          await loadProducts();
          await loadStats();
        } else {
          showMessage("❌ Mahsulot qo'shishda xatolik!", "error");
        }
      } catch (error) {
        console.error("Xatolik:", error);
        showMessage("❌ Xatolik yuz berdi!", "error");
      }
    });
  }

  // Kategoriya qo'shish formasi
  const addCategoryForm = document.getElementById("addCategoryForm");
  if (addCategoryForm) {
    addCategoryForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = {
        name: document.getElementById("categoryName").value,
        description: document.getElementById("categoryDescription").value,
      };

      try {
        const response = await fetch(`${API_BASE_URL}/categories`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          showMessage("✅ Kategoriya muvaffaqiyatli qo'shildi!", "success");
          addCategoryForm.reset();
          hideAddCategoryForm();
          await loadCategories();
          await loadStats();
        } else {
          showMessage("❌ Kategoriya qo'shishda xatolik!", "error");
        }
      } catch (error) {
        console.error("Xatolik:", error);
        showMessage("❌ Xatolik yuz berdi!", "error");
      }
    });
  }

  // Qidiruv event'lari
  const productSearch = document.getElementById("productSearch");
  if (productSearch) {
    productSearch.addEventListener("input", searchProducts);
  }

  const pendingSearch = document.getElementById("pendingSearch");
  if (pendingSearch) {
    pendingSearch.addEventListener("input", searchPendingProducts);
  }
}

// Kategoriya qo'shish formasi
function showAddCategoryForm() {
  document.getElementById("addCategoryModal").style.display = "block";
}

function hideAddCategoryForm() {
  document.getElementById("addCategoryModal").style.display = "none";
}

// Mahsulot amallari
async function approveProduct(productId) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        needsReview: false,
        isActive: true,
        approvedBy: "admin",
      }),
    });

    if (response.ok) {
      showMessage("✅ Mahsulot tasdiqlandi!", "success");
      await loadPendingProducts();
      await loadStats();
    } else {
      showMessage("❌ Tasdiqlashda xatolik!", "error");
    }
  } catch (error) {
    console.error("Xatolik:", error);
    showMessage("❌ Xatolik yuz berdi!", "error");
  }
}

async function rejectProduct(productId) {
  const reason = prompt("Rad etish sababi:");
  if (!reason) return;

  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        needsReview: false,
        isActive: false,
        rejectedBy: "admin",
        rejectionReason: reason,
      }),
    });

    if (response.ok) {
      showMessage("❌ Mahsulot rad etildi!", "success");
      await loadPendingProducts();
      await loadStats();
    } else {
      showMessage("❌ Rad etishda xatolik!", "error");
    }
  } catch (error) {
    console.error("Xatolik:", error);
    showMessage("❌ Xatolik yuz berdi!", "error");
  }
}

async function editPendingProduct(productId) {
  const product = products.find((p) => p._id === productId);
  if (!product) return;

  // Form'ni to'ldirish
  document.getElementById("productName").value = product.name;
  document.getElementById("productDescription").value =
    product.description || "";
  document.getElementById("productPrice").value = product.price || "";
  document.getElementById("productCategory").value = product.category || "";
  document.getElementById("productImage").value = product.image || "";
  document.getElementById("productStock").value = product.stock || 0;

  // Add Product tab'ga o'tish
  showTab("add-product");

  // Form'ni tahrirlash rejimiga o'tkazish
  const form = document.getElementById("addProductForm");
  form.dataset.editMode = "true";
  form.dataset.editId = productId;

  // Submit button'ni o'zgartirish
  const submitBtn = form.querySelector("button[type='submit']");
  submitBtn.textContent = "✏️ Mahsulotni tahrirlash";
}

async function deleteProduct(productId) {
  if (!confirm("Bu mahsulotni o'chirishni xohlaysizmi?")) return;

  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      showMessage("🗑️ Mahsulot o'chirildi!", "success");
      await loadProducts();
      await loadStats();
    } else {
      showMessage("❌ O'chirishda xatolik!", "error");
    }
  } catch (error) {
    console.error("Xatolik:", error);
    showMessage("❌ Xatolik yuz berdi!", "error");
  }
}

async function editProduct(productId) {
  const product = products.find((p) => p._id === productId);
  if (!product) return;

  // Form'ni to'ldirish va tahrirlash rejimiga o'tkazish
  editPendingProduct(productId);
}

async function viewProduct(productId) {
  const product = products.find((p) => p._id === productId);
  if (!product) return;

  // Bot'ga mahsulot ko'rish haqida ma'lumot yuborish
  sendToBot({
    action: "view_product",
    productId: productId,
    productName: product.name,
  });

  showMessage(`👁️ "${product.name}" mahsuloti ko'rilmoqda`, "success");
}

// Kategoriya amallari
async function editCategory(categoryId) {
  const category = categories.find((c) => c._id === categoryId);
  if (!category) return;

  const newName = prompt("Yangi kategoriya nomi:", category.name);
  if (!newName) return;

  try {
    const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: newName,
        description: category.description,
      }),
    });

    if (response.ok) {
      showMessage("✏️ Kategoriya tahrirlandi!", "success");
      await loadCategories();
      await loadStats();
    } else {
      showMessage("❌ Tahrirlashda xatolik!", "error");
    }
  } catch (error) {
    console.error("Xatolik:", error);
    showMessage("❌ Xatolik yuz berdi!", "error");
  }
}

async function deleteCategory(categoryId) {
  const category = categories.find((c) => c._id === categoryId);
  if (!category) return;

  // Kategoriyada mahsulotlar borligini tekshirish
  const productsInCategory = products.filter((p) => p.category === categoryId);
  if (productsInCategory.length > 0) {
    showMessage(
      `⚠️ Bu kategoriyada ${productsInCategory.length} ta mahsulot bor. Avval mahsulotlarni boshqa kategoriyaga ko'chiring!`,
      "warning"
    );
    return;
  }

  if (!confirm(`"${category.name}" kategoriyasini o'chirishni xohlaysizmi?`))
    return;

  try {
    const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      showMessage("🗑️ Kategoriya o'chirildi!", "success");
      await loadCategories();
      await loadStats();
    } else {
      showMessage("❌ O'chirishda xatolik!", "error");
    }
  } catch (error) {
    console.error("Xatolik:", error);
    showMessage("❌ Xatolik yuz berdi!", "error");
  }
}

// Bot'ga ma'lumot yuborish
function sendToBot(data) {
  if (tg && tg.sendData) {
    tg.sendData(JSON.stringify(data));
  }
}

// Xabar ko'rsatish
function showMessage(message, type = "info") {
  const container = document.getElementById("messagesContainer");
  if (!container) return;

  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${type}`;
  messageDiv.textContent = message;

  container.appendChild(messageDiv);

  // 5 soniyadan keyin xabarni o'chirish
  setTimeout(() => {
    messageDiv.remove();
  }, 5000);
}

// Qidiruv va filtrlash event'lari
document.addEventListener("DOMContentLoaded", function () {
  // Mahsulot qidiruv
  const productSearch = document.getElementById("productSearch");
  if (productSearch) {
    productSearch.addEventListener("input", searchProducts);
  }

  // Ko'rib chiqilishi kerak mahsulotlar qidiruv
  const pendingSearch = document.getElementById("pendingSearch");
  if (pendingSearch) {
    pendingSearch.addEventListener("input", searchPendingProducts);
  }

  // Kategoriya filtrlari
  const categoryFilter = document.getElementById("categoryFilter");
  if (categoryFilter) {
    categoryFilter.addEventListener("change", searchProducts);
  }

  const pendingCategoryFilter = document.getElementById(
    "pendingCategoryFilter"
  );
  if (pendingCategoryFilter) {
    pendingCategoryFilter.addEventListener("change", searchPendingProducts);
  }
});

