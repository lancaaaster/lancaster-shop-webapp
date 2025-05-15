let tg = window.Telegram.WebApp;
let cart = [];

// Категории и подкатегории
const categories = {
    'subscriptions': {
        name: 'Подписки',
        subcategories: ['Spotify', 'Discord', 'Яндекс']
    },
    'pc-games': {
        name: 'PC Игры',
        subcategories: ['Minecraft', 'GTA V', 'Cyberpunk 2077']
    },
    'mobile-games': {
        name: 'Мобильные игры',
        subcategories: ['Brawl Stars', 'Clash of Clans', 'Clash Royale']
    }
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    tg.expand();
    tg.enableClosingConfirmation();

    // Инициализация обработчиков событий
    initializeEventListeners();
    
    // Загрузка данных
    loadProducts();
    loadUserProfile();
});

// Инициализация обработчиков событий
function initializeEventListeners() {
    // Кнопки навигации
    document.getElementById('profileBtn').addEventListener('click', showProfile);
    document.getElementById('cartBtn').addEventListener('click', showCart);
    document.getElementById('supportBtn').addEventListener('click', showSupport);

    // Категории
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateSubcategories(btn.dataset.category);
            filterProducts(btn.dataset.category);
        });
    });

    // Закрытие модальных окон
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal').style.display = 'none';
        });
    });

    // Кнопка оформления заказа
    document.getElementById('checkoutBtn').addEventListener('click', handleCheckout);
}

// Обновление подкатегорий
function updateSubcategories(category) {
    const subcategoriesContainer = document.querySelector('.subcategories');
    subcategoriesContainer.innerHTML = '';

    if (category === 'all') {
        subcategoriesContainer.style.display = 'none';
        return;
    }

    const categoryData = categories[category];
    if (categoryData && categoryData.subcategories) {
        subcategoriesContainer.style.display = 'flex';
        categoryData.subcategories.forEach(subcategory => {
            const button = document.createElement('button');
            button.className = 'subcategory-btn';
            button.textContent = subcategory;
            button.addEventListener('click', () => {
                document.querySelectorAll('.subcategory-btn').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                filterProducts(category, subcategory);
            });
            subcategoriesContainer.appendChild(button);
        });
    }
}

// Применяем цветовую схему Telegram
document.documentElement.style.setProperty('--tg-theme-bg-color', tg.backgroundColor);
document.documentElement.style.setProperty('--tg-theme-text-color', tg.textColor);
document.documentElement.style.setProperty('--tg-theme-button-color', tg.buttonColor);
document.documentElement.style.setProperty('--tg-theme-button-text-color', tg.buttonTextColor);

// Загрузка товаров
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        const products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('Ошибка при загрузке товаров:', error);
        showError('Не удалось загрузить товары');
    }
}

// Отображение товаров
function displayProducts(products) {
    const container = document.getElementById('productsContainer');
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
    card.dataset.category = product.category;
    card.dataset.subcategory = product.subcategory;

    card.innerHTML = `
        ${product.imageUrl ? `<img src="${product.imageUrl}" alt="${product.name}" class="product-image">` : ''}
        <div class="product-name">${product.name}</div>
        <div class="product-description">${product.description || ''}</div>
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

// Фильтрация товаров
function filterProducts(category, subcategory = null) {
    const products = document.querySelectorAll('.product-card');
    products.forEach(product => {
        if (category === 'all') {
            product.style.display = 'flex';
        } else if (subcategory) {
            product.style.display = 
                product.dataset.category === category && 
                product.dataset.subcategory === subcategory ? 'flex' : 'none';
        } else {
            product.style.display = 
                product.dataset.category === category ? 'flex' : 'none';
        }
    });
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

function updateCartTotal() {
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    document.getElementById('cartTotal').textContent = formatPrice(total);
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

    updateCartTotal();
    modal.style.display = 'block';
}

function showProfile() {
    loadUserProfile();
    const modal = document.getElementById('profileModal');
    modal.style.display = 'block';
}

function showSupport() {
    const modal = document.getElementById('supportModal');
    modal.style.display = 'block';
}

// Профиль пользователя
async function loadUserProfile() {
    try {
        const response = await fetch('/api/user/profile');
        const profile = await response.json();
        updateProfileInfo(profile);
        loadUserOrders(profile.id);
    } catch (error) {
        console.error('Ошибка при загрузке профиля:', error);
    }
}

function updateProfileInfo(profile) {
    document.getElementById('profileTelegramId').textContent = profile.telegramId;
    document.getElementById('profileName').textContent = profile.username;
    document.getElementById('profileBalance').textContent = formatPrice(profile.balance);
}

async function loadUserOrders(userId) {
    try {
        const response = await fetch(`/api/user/${userId}/orders`);
        const orders = await response.json();
        displayOrders(orders);
    } catch (error) {
        console.error('Ошибка при загрузке истории заказов:', error);
    }
}

function displayOrders(orders) {
    const ordersList = document.getElementById('ordersList');
    ordersList.innerHTML = orders.map(order => `
        <div class="order-item">
            <div class="order-header">
                <span class="order-date">${new Date(order.orderDate).toLocaleDateString()}</span>
                <span class="order-total">${formatPrice(order.totalAmount)}</span>
            </div>
            <div class="order-items">
                ${order.items.map(item => `
                    <div class="order-item-detail">
                        ${item.name} x ${item.quantity}
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// Оформление заказа
async function handleCheckout() {
    if (cart.length === 0) {
        showError('Корзина пуста');
        return;
    }

    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                items: cart.map(item => ({
                    productId: item.id,
                    quantity: item.quantity
                }))
            })
        });

        if (response.ok) {
            cart = [];
            updateCartCount();
            document.getElementById('cartModal').style.display = 'none';
            showNotification('Заказ успешно оформлен');
            tg.close();
        } else {
            throw new Error('Ошибка при оформлении заказа');
        }
    } catch (error) {
        console.error('Ошибка при оформлении заказа:', error);
        showError('Не удалось оформить заказ');
    }
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

function contactSupport(method) {
    if (method === 'telegram') {
        tg.openTelegramLink('https://t.me/support');
    } else if (method === 'email') {
        window.location.href = 'mailto:support@example.com';
    }
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
    // Здесь должна быть реализация поиска товара по ID
    return null; // Временная заглушка
} 