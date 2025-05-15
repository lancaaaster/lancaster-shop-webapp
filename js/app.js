let tg = window.Telegram.WebApp;
let cart = [];

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    tg.expand();
    tg.enableClosingConfirmation();

    // Инициализация обработчиков событий
    initializeEventListeners();
    
    // Загрузка данных
    loadGameProducts();
});

// Инициализация обработчиков событий
function initializeEventListeners() {
    // Кнопки навигации
    document.getElementById('profileBtn').addEventListener('click', showProfile);
    document.getElementById('cartBtn').addEventListener('click', showCart);
    document.getElementById('supportBtn').addEventListener('click', showSupport);

    // Закрытие модальных окон
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal').style.display = 'none';
        });
    });
}

// Применяем цветовую схему Telegram
document.documentElement.style.setProperty('--tg-theme-bg-color', tg.backgroundColor);
document.documentElement.style.setProperty('--tg-theme-text-color', tg.textColor);
document.documentElement.style.setProperty('--tg-theme-button-color', tg.buttonColor);
document.documentElement.style.setProperty('--tg-theme-button-text-color', tg.buttonTextColor);

// Загрузка товаров для каждой игры
async function loadGameProducts() {
    try {
        const [csgoProducts, dotaProducts, rustProducts] = await Promise.all([
            fetch('/api/products/csgo').then(res => res.json()),
            fetch('/api/products/dota2').then(res => res.json()),
            fetch('/api/products/rust').then(res => res.json())
        ]);

        displayGameProducts('csgoProducts', csgoProducts);
        displayGameProducts('dotaProducts', dotaProducts);
        displayGameProducts('rustProducts', rustProducts);
    } catch (error) {
        console.error('Ошибка при загрузке товаров:', error);
        showError('Не удалось загрузить товары');
    }
}

// Отображение товаров для конкретной игры
function displayGameProducts(containerId, products) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    products.forEach(product => {
        const productCard = createProductCard(product);
        container.appendChild(productCard);
    });
}

// Создание карточки товара
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
        <div class="product-name">${product.name}</div>
        <div class="product-price">${formatPrice(product.price)}</div>
        <div class="product-actions">
            <button class="action-button" onclick="buyNow(${product.id})">
                <i class="fas fa-bolt"></i>
            </button>
            <button class="action-button" onclick="addToCart(${product.id})">
                <i class="fas fa-cart-plus"></i>
            </button>
        </div>
    `;
    return card;
}

// Быстрая покупка
async function buyNow(productId) {
    try {
        const response = await fetch('/api/orders/instant', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ productId })
        });

        if (response.ok) {
            showNotification('Товар успешно куплен');
            tg.close();
        } else {
            throw new Error('Ошибка при покупке');
        }
    } catch (error) {
        console.error('Ошибка при покупке:', error);
        showError('Не удалось совершить покупку');
    }
}

// Работа с корзиной
function addToCart(productId) {
    const product = findProduct(productId);
    if (product) {
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        updateCartCount();
        showNotification('Товар добавлен в корзину');
    }
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = count;
}

// Модальные окна
function showCart() {
    const modal = document.getElementById('cartModal');
    const cartItems = document.getElementById('cartItems');
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-price">${formatPrice(item.price)}</div>
            <div class="cart-item-quantity">
                <button onclick="updateCartItemQuantity(${item.id}, -1)">-</button>
                <span>${item.quantity}</span>
                <button onclick="updateCartItemQuantity(${item.id}, 1)">+</button>
            </div>
        </div>
    `).join('');

    modal.style.display = 'block';
}

function showProfile() {
    const modal = document.getElementById('profileModal');
    modal.style.display = 'block';
}

function showSupport() {
    const modal = document.getElementById('supportModal');
    modal.style.display = 'block';
}

// Вспомогательные функции
function formatPrice(price) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB'
    }).format(price);
}

function showNotification(message) {
    tg.showPopup({
        title: 'Уведомление',
        message: message
    });
}

function showError(message) {
    tg.showPopup({
        title: 'Ошибка',
        message: message
    });
}

function contactSupport() {
    tg.openTelegramLink('https://t.me/support');
}

function updateCartItemQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.id !== productId);
        }
        updateCartCount();
        showCart();
    }
}

function findProduct(productId) {
    // Implementation of findProduct function
} 