import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-analytics.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyAQyZxvEglP-Xx4tmJX-Va2U40C_7p31Ic",
    authDomain: "food-96016.firebaseapp.com",
    databaseURL: "https://food-96016-default-rtdb.firebaseio.com",
    projectId: "food-96016",
    storageBucket: "food-96016.appspot.com",
    messagingSenderId: "562474008381",
    appId: "1:562474008381:web:28dbf08887eb90f386cf54",
    measurementId: "G-CWYYLEN8KD"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);

// Пример функции добавления заказа
function addOrder(itemName, price , tel) {
    const ordersRef = ref(database, 'orders');
    push(ordersRef, {
        item: itemName,
        price: price,
        tel: tel , 
        date: new Date().toISOString()
    }).then(() => {
        console.log('Order added successfully!');
    }).catch(error => {
        console.error('Error adding order:', error);
    });
}




document.addEventListener("DOMContentLoaded", function () {
    const modalCart = document.querySelector(".modal-cart");
    const cartButton = document.getElementById("cart-button");
    const closeCartButton = modalCart.querySelector(".close");
    const clearCartButton = modalCart.querySelector(".clear-cart");
    const modalBody = modalCart.querySelector(".modal-body");
    const modalPriceTag = modalCart.querySelector(".modal-pricetag");
    const placeOrderButton = document.getElementById("place-order-button");

    let cart = [];

    // Функция для сохранения корзины в localStorage
    function saveCart() {
        localStorage.setItem("cart", JSON.stringify(cart));
    }

    // Функция для загрузки корзины из localStorage
    function loadCart() {
        const savedCart = localStorage.getItem("cart");
        cart = savedCart ? JSON.parse(savedCart) : [];
    }

    // Функция для обновления отображения корзины
    function updateCart() {
        modalBody.innerHTML = "";
        if (cart.length === 0) {
            modalBody.innerHTML = `<p class="empty-cart">Корзина пуста</p>`;
            modalPriceTag.textContent = "0 ₴";
            return;
        }
    
        let total = 0;
        cart.forEach((item, index) => {
            total += item.price * item.quantity;
    
            const itemHTML = `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image" style="width:100px; height:100px;" />
                    <div class="cart-item-info">
                        <span class="cart-item-name">${item.name}</span>
                        <div class="cart-controls">
                            <button class="button-decrease" data-index="${index}">-</button>
                            <span>${item.quantity}</span>
                            <button class="button-increase" data-index="${index}">+</button>
                        </div>
                    </div>
                    <span class="cart-item-price">${item.price * item.quantity} ₴</span>
                    <button class="button-remove" data-index="${index}">&times;</button>
                    <div class="phone-input">
                        <label for="phone-${index}">Телефон:</label>
                        <input type="tel" id="phone-${index}" class="phone-number" placeholder="Введите номер" value="${item.phone || ''}" />
                    </div>
                </div>
            `;
            modalBody.insertAdjacentHTML("beforeend", itemHTML);
        });
        modalPriceTag.textContent = `${total} ₴`;
    }
    
    // Делаем функцию addToCart глобальной, чтобы её можно было вызывать извне
    window.addToCart = addToCart;

    // Функция для добавления товара в корзину
    function addToCart(item) {
        const existingItem = cart.find((cartItem) => cartItem.name === item.name);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...item, quantity: 1 });
        }
        saveCart();
        updateCart();
    }

    

    // Функция для сохранения заказа в Firebase
    function saveOrder(order) {
        const ordersRef = ref(database, "orders");
        return push(ordersRef, order);
    }

    // Обработчик событий для элементов корзины
    modalBody.addEventListener("click", (event) => {
        const button = event.target;
        const index = parseInt(button.dataset.index, 10);

        if (button.classList.contains("button-remove")) {
            cart.splice(index, 1);
        } else if (button.classList.contains("button-increase")) {
            cart[index].quantity++;
        } else if (button.classList.contains("button-decrease")) {
            cart[index].quantity--;
            if (cart[index].quantity <= 0) {
                cart.splice(index, 1);
            }
        }
        saveCart();
        updateCart();
    });

    // Кнопка очистки корзины
    clearCartButton.addEventListener("click", () => {
        cart = [];
        saveCart();
        updateCart();
    });

    // Кнопка открытия корзины
    cartButton.addEventListener("click", () => {
        if (!localStorage.getItem("login")) {
            alert("Пожалуйста, войдите в систему, чтобы открыть корзину.");
            return;
        }
        modalCart.style.display = "flex";
        updateCart();
    });

    // Кнопка закрытия корзины
    closeCartButton.addEventListener("click", () => {
        modalCart.style.display = "none";
    });

    // Кнопка оформления заказа
    placeOrderButton.addEventListener("click", () => {
        if (cart.length === 0) {
            alert("Ваша корзина пуста!");
            return;
        }

        const order = {
            items: cart,
            total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
            user: localStorage.getItem("login") || "Гость",
            date: new Date().toISOString()
        };

        saveOrder(order)
            .then(() => {
                alert("Ваш заказ успешно оформлен!");
                cart = [];
                saveCart();
                updateCart();
            })
            .catch((error) => {
                console.error("Ошибка при сохранении заказа:", error);
                alert("Произошла ошибка при оформлении заказа. Попробуйте снова.");
            });
    });

    // Загрузка корзины при загрузке страницы
    loadCart();
});

