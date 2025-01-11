
document.addEventListener("DOMContentLoaded", function () {
    const authButton = document.querySelector(".button-auth");
    const logoutButton = document.querySelector(".button-out");
    const modalAuth = document.querySelector(".modal-auth");
    const closeAuthButton = document.querySelector(".close-auth");
    const loginForm = document.getElementById("logInForm");
    const loginInput = document.getElementById("login");
    const passwordInput = document.getElementById("password");
    const userNameSpan = document.querySelector(".user-name");
    const cardsContainer = document.querySelector(".cards.cards-restaurants");
    const modalCart = document.querySelector(".modal-cart");
    const cartButton = document.getElementById("cart-button");
    const closeCartButton = modalCart.querySelector(".close");
    const clearCartButton = modalCart.querySelector(".clear-cart");
    const modalBody = modalCart.querySelector(".modal-body");
    const modalPriceTag = modalCart.querySelector(".modal-pricetag");
    const restaurantNameHeader = document.getElementById("restaurant-name");
    const searchInput = document.querySelector(".input-search");

    

    

   
    const style = document.createElement("style");
style.textContent = `
    .cart-item {
        display: flex;
        align-items: center;
        gap: 15px; /* Расстояние между элементами */
        margin-bottom: 15px;
        border-bottom: 1px solid #ddd;
        padding-bottom: 10px;
    }
    .cart-item-image {
        width: 50px;
        height: 50px;
        object-fit: cover;
        border-radius: 5px;
    }
    .cart-item-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 5px;
    }
    .cart-controls {
        display: flex;
        gap: 10px;
        align-items: center;
    }
    .cart-item-price {
        font-weight: bold;
        margin-left: auto; /* Отодвигает цену в конец строки */
        font-size: 16px;
        color: #555;
    }
    .button-remove {
        background: none;
        border: none;
        color: red;
        cursor: pointer;
        font-size: 18px;
    }
`;
document.head.appendChild(style);


    

   

    const dbFolder = "db/";

    async function loadRestaurantData() {
        const fileNames = [
            "food-band.json",
            "ikigai.json",
            "partners.json",
            "pizza-burger.json",
            "pizza-plus.json",
            "puzata-hata.json",
            "tanuki.json",
        ];

        const restaurantData = [];

        for (const fileName of fileNames) {
            try {
                const response = await fetch(`${dbFolder}${fileName}`);
                const data = await response.json();

                const updatedData = data.map(restaurant => ({
                    ...restaurant,
                    fileName: fileName.replace(/\.json$/, "")
                }));

                restaurantData.push(...updatedData);
            } catch (error) {
                console.error(`Ошибка загрузки файла ${fileName}:`, error);
            }
        }

        return restaurantData;
    }

    function generateRestaurantCards(data) {
        cardsContainer.innerHTML = "";
        data.forEach(restaurant => {
            const cardHTML = `
                <div class="card card-restaurant" data-file-name="${restaurant.fileName}">
                    <img src="${restaurant.image}" alt="${restaurant.name}" class="cart-item" style="width: 100%; height: 200px; " />
                    <div class="card-text">
                        <div class="card-heading">
                            <h3 class="card-title">${restaurant.name}</h3>
                            <span class="card-tag tag">${restaurant.time || "Час неизвестен"}</span>
                        </div>
                        <div class="card-info">
                            <div class="rating">${restaurant.rating || "Рейтинг недоступен"}</div>
                            <div class="price">${restaurant.price || "Цена недоступна"}</div>
                            <div class="category">${restaurant.category || "Категория неизвестна"}</div>
                        </div>
                    </div>
                    <button class="button button-add-cart" data-item='${JSON.stringify({
                        name: restaurant.name,
                        price: restaurant.price || 0,
                        image: restaurant.image || "style=width: 100%; height: 200px;object-fit: cover;",
                    })}'>Добавить в корзину</button>
                </div>
            `;
            cardsContainer.insertAdjacentHTML("beforeend", cardHTML);
        });
    }

    function updateRestaurantHeader(fileName) {
        restaurantNameHeader.textContent = `Ви переглядаєте меню з ресторану: ${fileName}`;
    }

    cardsContainer.addEventListener("click", function (event) {
        const button = event.target;

        if (button.classList.contains("button-add-cart")) {
            const itemData = JSON.parse(button.dataset.item);
            addToCart(itemData);
            alert(`${itemData.name} добавлен в корзину!`);
            return;
        }

        const card = button.closest(".card-restaurant");
        if (!card) return;

        if (!localStorage.getItem("login")) {
            modalAuth.style.display = "flex";
            document.body.style.overflow = "hidden";
        } else {
            const fileName = card.dataset.fileName;
            updateRestaurantHeader(fileName);
        }
    });

    searchInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            const searchQuery = searchInput.value.trim().toLowerCase();

            if (!searchQuery) {
                searchInput.style.borderColor = "red";
                setTimeout(() => {
                    searchInput.style.borderColor = "";
                }, 2000);
                return;
            }

            loadRestaurantData().then(data => {
                const filteredData = data.filter(item => 
                    item.name.toLowerCase().includes(searchQuery)
                );
                generateRestaurantCards(filteredData);
            });
        }
    });

    authButton.addEventListener("click", () => {
        modalAuth.style.display = "flex";
        document.body.style.overflow = "hidden";
        resetInputBorders();
    });

    closeAuthButton.addEventListener("click", () => {
        closeModal();
    });

    modalAuth.addEventListener("click", (event) => {
        if (event.target === modalAuth) {
            closeModal();
        }
    });

    loginForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const login = loginInput.value.trim();
        const password = passwordInput.value.trim();

        if (!login || !password) {
            if (!login) loginInput.style.borderColor = "red";
            if (!password) passwordInput.style.borderColor = "red";
            alert("Пожалуйста, заполните все поля.");
        } else {
            localStorage.setItem("login", login);
            displayLoggedIn(login);
            closeModal();
        }
    });

    logoutButton.addEventListener("click", () => {
        localStorage.removeItem("login");
        displayLoggedOut();
    });

    function displayLoggedIn(login) {
        authButton.style.display = "none";
        logoutButton.style.display = "inline-block";
        userNameSpan.textContent = login;
        userNameSpan.style.display = "inline";
        loginInput.style.borderColor = "";
        passwordInput.style.borderColor = "";
    }

    function displayLoggedOut() {
        authButton.style.display = "inline-block";
        logoutButton.style.display = "none";
        userNameSpan.textContent = "";
        userNameSpan.style.display = "none";
        loginInput.value = "";
        passwordInput.value = "";
    }

    function closeModal() {
        modalAuth.style.display = "none";
        document.body.style.overflow = "";
        resetInputBorders();
    }

    function resetInputBorders() {
        loginInput.style.borderColor = "";
        passwordInput.style.borderColor = "";
    }

    async function init() {
       
        const restaurantData = await loadRestaurantData();
        generateRestaurantCards(restaurantData);

        if (localStorage.getItem("login")) {
            displayLoggedIn(localStorage.getItem("login"));
        } else {
            displayLoggedOut();
        }
    }

    init();
});





