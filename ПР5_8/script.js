import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getDatabase, ref, get, push } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

// Конфигурация Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDwfMn33GfKAIQXtW6FhgkA0hGDD9WmeVc",
  authDomain: "magazin-f5e8e.firebaseapp.com",
  databaseURL: "https://magazin-f5e8e-default-rtdb.firebaseio.com",
  projectId: "magazin-f5e8e",
  storageBucket: "magazin-f5e8e.appspot.com",
  messagingSenderId: "808146273287",
  appId: "1:808146273287:web:70569dd4e858eda29cd6a2",
  measurementId: "G-RQ2YX9HHZP",
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Переменные для хранения данных
let bagProductsData = [];
let clothesProductsData = [];
let perfumeProductsData = [];
let underwearProductsData = [];
let cart = [];

window.addToCart = addToCart;
window.sendOrder = sendOrder;
window.clearCart = clearCart ;
window.clearCart2 = clearCart2 ;
window.prepareProducts = prepareProducts;
// Загрузка данных из Firebase
function loadDataFromFirebase() {
  return get(ref(database, "/"))
    .then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        bagProductsData = prepareProducts(data.bagProductsData, "bag");
        clothesProductsData = prepareProducts(data.clothesProductsData, "clothes");
        perfumeProductsData = prepareProducts(data.perfumeProductsData, "perfume");
        underwearProductsData = prepareProducts(data.underwearProductsData, "underwear");

        renderAllProducts();
      } else {
        console.error("Данные отсутствуют в базе данных Firebase.");
      }
    })
    .catch((error) => {
      console.error("Ошибка загрузки данных из Firebase:", error);
    });
}

// Подготовка данных
function prepareProducts(products, prefix) {
  return (products || []).map((product, index) => ({
    ...product,
    id: product.id || `${prefix}-${index}`, // Генерация уникального ID
  }));
}

// Рендеринг всех категорий
function renderAllProducts() {
  displayProducts(bagProductsData, "bagProducts");
  displayProducts(underwearProductsData, "underwearProducts");
  displayProducts(clothesProductsData, "clothesProducts");
  displayProducts(perfumeProductsData, "perfumeProducts");
}

// Отображение товаров
function displayProducts(products, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  if (products.length === 0) {
    container.innerHTML = "<p>Товару немає .</p>";
    return;
  }

  products.forEach((product) => {
    const productDiv = document.createElement("div");
    productDiv.className = "col-lg-4 mb-4";

    const imagesCarousel = createImageCarousel(product);

    productDiv.innerHTML = `
      <div class="card">
        ${imagesCarousel}
        <div class="card-body">
          <h5 class="card-title">${product.name}</h5>
          <p class="card-text">${product.title || ""}</p>
          <p class="card-text"><strong>${product.price} грн</strong></p>
          <button class="btn btn-primary" onclick="addToCart('${product.id}')">Додати до кошика</button>
        </div>
      </div>
    `;
    container.appendChild(productDiv);
  });
}

// Создание карусели изображений
function createImageCarousel(product) {
  if (!product.images || product.images.length === 0) return "";

  return `
    <div id="carousel${product.id}" class="carousel slide" data-ride="carousel">
      <div class="carousel-inner">
        ${product.images
          .map(
            (image, index) => `
          <div class="carousel-item ${index === 0 ? "active" : ""}">
            <img src="${image}" class="d-block w-100" alt="${product.name}" style="height: 250px; object-fit: cover;">
          </div>
        `
          )
          .join("")}
      </div>
      <a class="carousel-control-prev" href="#carousel${product.id}" role="button" data-slide="prev">
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="sr-only">Previous</span>
      </a>
      <a class="carousel-control-next" href="#carousel${product.id}" role="button" data-slide="next">
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="sr-only">Next</span>
      </a>
    </div>
  `;
}

// Добавление в корзину
function addToCart(productId) {
  // Объединяем массивы всех товаров
  const allProducts = [
      ...bagProductsData,
      ...underwearProductsData,
      ...clothesProductsData,
      ...perfumeProductsData,
  ];

  // Ищем товар по ID
  const product = allProducts.find((item) => item && item.id === productId);

  // Проверяем, найден ли товар
  if (product) {
      cart.push(product);
      updateCart();
      alert("Товар додано до кошику !");
  } else {
      console.error(`Продукт с ID "${productId}" не найден.`);
  }
}


// Обновление корзины
function updateCart() {
  const cartItemsContainer = document.getElementById("cartItems");
  const totalPriceContainer = document.getElementById("totalPrice");

  cartItemsContainer.innerHTML = "";

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = "<p>Кошик порожній.</p>";
    totalPriceContainer.textContent = "0";
    return;
  }

  let totalPrice = 0;

  cart.forEach((product, index) => {
    const item = document.createElement("li");
    item.className = "list-group-item d-flex justify-content-between align-items-center";
    item.innerHTML = `
      ${product.name} - ${product.price} грн
      <button class="btn btn-danger btn-sm" onclick="clearCart(${index})">Видалити</button>
    `;

    totalPrice += parseFloat(product.price);
    cartItemsContainer.appendChild(item);
  });

  totalPriceContainer.textContent = totalPrice.toFixed(2);
}

// Удаление из корзины
function clearCart(index) {
  cart.splice(index, 1);
  updateCart();
}
// Функция для удаления всех элементов из корзины
function clearCart2() {
  cart = []; // Очищаем массив корзины
  updateCart(); // Обновляем отображение
}

// Функция для проверки обязательных полей
function validateOrderFields(params) {
  // Проверка, что все обязательные поля не пустые
  return params.fromName && params.toSecondname && params.customerPatronymic &&
         params.customerPhone && params.shippingService && params.customerAddress && params.cartContent;
}

// Оформление заказа
function sendOrder() { 
  let cartContent = cart.map(item => `${item.name} - ${item.price} грн`).join("\n");
  let totalPrice = cart.reduce((sum, item) => sum + item.price, 0);
  
  let params = {
      fromName: document.getElementById('customerName').value,
      toSecondname: document.getElementById('customerSurname').value,
      customerPatronymic: document.getElementById('customerPatronymic').value,
      customerPhone: document.getElementById('customerPhone').value,
      shippingService: document.getElementById('shippingService').value,
      customerAddress: document.getElementById('customerAddress').value,
      cartContent: cartContent,
      totalPrice: `${totalPrice} грн`
  };

  // Проверка, что все поля заполнены
  if (!validateOrderFields(params)) {
    alert("Будь ласка, заповніть всі необхідні поля!");
    return;
    }  

  let message = `Замовлення від: ${params.fromName} ${params.toSecondname} ${params.customerPatronymic}\n` +
                `Телефон: ${params.customerPhone}\n` +
                `Адреса: ${params.customerAddress}\n` +
                `Служба доставки: ${params.shippingService}\n` +
                `Товари:\n${params.cartContent}\n` +
                `Всього: ${params.totalPrice}`;

  let botToken = "8025067562:AAGL1kxWQ96_WfNZ1sVndOBeIgOipjcXVmE";  // Убедитесь, что токен правильный
  let chatId = "-1002442620212";  // Убедитесь, что chatId правильный
  let telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

  fetch(telegramApiUrl, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          chat_id: chatId,
          text: message
      })
  });
  alert("Замовлення успішно оформлене")
}

// Универсальная функция для фильтрации товаров по цене
function updatePriceFilter(category, value, displayId) {
  const maxPrice = parseInt(value);
  document.getElementById(displayId).textContent = maxPrice ;

  // Выбор массива данных в зависимости от категории
  let productsData;
  let containerId;
  switch (category) {
    case "bags":
      productsData = bagProductsData;
      containerId = "bagProducts";
      break;
    case "clothes":
      productsData = clothesProductsData;
      containerId = "clothesProducts";
      break;
    case "perfumes":
      productsData = perfumeProductsData;
      containerId = "perfumeProducts";
      break;
    case "underwear":
      productsData = underwearProductsData;
      containerId = "underwearProducts";
      break;
    default:
      console.error("Неизвестная категория для фильтрации:", category);
      return;
  }

  // Фильтрация и отображение товаров
  const filteredProducts = productsData.filter(product => product.price <= maxPrice);
  displayProducts(filteredProducts, containerId);
}

// Пример вызова фильтрации для каждой категории
window.updatePriceFilterBags = function(value) {
  updatePriceFilter("bags", value, "priceDisplay");
};

window.updatePriceFilterClothes = function(value) {
  updatePriceFilter("clothes", value, "priceDisplay2");
};

window.updatePriceFilterPerfumes = function(value) {
  updatePriceFilter("perfumes", value, "priceDisplay3");
};

window.updatePriceFilterUnderwear = function(value) {
  updatePriceFilter("underwear", value, "priceDisplay4");
};
window.clearCart = clearCart ;


// Загрузка данных при старте страницы
document.addEventListener("DOMContentLoaded", loadDataFromFirebase);











