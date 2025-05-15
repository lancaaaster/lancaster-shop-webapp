let tg = window.Telegram.WebApp;
let cart = [];

// Инициализация Telegram WebApp
tg.expand();
tg.enableClosingConfirmation();

// Данные о товарах
const products = {
    brawl_stars: [
        { id: 'bs_gems_30', name: '30 Гемов', price: 39, image: 'img/bs_gems.jpg', category: 'brawl_stars' },
        { id: 'bs_gems_80', name: '80 Гемов', price: 99, image: 'img/bs_gems.jpg', category: 'brawl_stars' },
        { id: 'bs_gems_170', name: '170 Гемов', price: 229, image: 'img/bs_gems.jpg', category: 'brawl_stars' },
        { id: 'bs_gems_360', name: '360 Гемов', price: 449, image: 'img/bs_gems.jpg', category: 'brawl_stars' },
        { id: 'bs_gems_950', name: '950 Гемов', price: 1190, image: 'img/bs_gems.jpg', category: 'brawl_stars' },
        { id: 'bs_pass', name: 'Brawl Pass', price: 269, image: 'img/bs_pass.jpg', category: 'brawl_stars' }
    ],
    clash_royale: [
        { id: 'cr_gems_80', name: '80 Гемов', price: 99, image: 'img/cr_gems.jpg', category: 'clash_royale' },
        { id: 'cr_gems_500', name: '500 Гемов', price: 499, image: 'img/cr_gems.jpg', category: 'clash_royale' },
        { id: 'cr_gems_1200', name: '1200 Гемов', price: 999, image: 'img/cr_gems.jpg', category: 'clash_royale' },
        { id: 'cr_pass', name: 'Royal Pass', price: 269, image: 'img/cr_pass.jpg', category: 'clash_royale' },
        { id: 'cr_chest', name: 'Королевский сундук', price: 199, image: 'img/cr_chest.jpg', category: 'clash_royale' }
    ],
    clash_of_clans: [
        { id: 'coc_gems_80', name: '80 Гемов', price: 99, image: 'img/coc_gems.jpg', category: 'clash_of_clans' },
        { id: 'coc_gems_500', name: '500 Гемов', price: 499, image: 'img/coc_gems.jpg', category: 'clash_of_clans' },
        { id: 'coc_gems_1200', name: '1200 Гемов', price: 999, image: 'img/coc_gems.jpg', category: 'clash_of_clans' },
        { id: 'coc_gold_pass', name: 'Gold Pass', price: 269, image: 'img/coc_pass.jpg', category: 'clash_of_clans' }
    ]
};

// Фильтрация товаров по категории
function filterByCategory(category) {
    const productsContainer = document.getElementById('products');
    productsContainer.innerHTML = '';
    
    products[category].forEach(product => {
        productsContainer.innerHTML += `
            <div class="col-6 mb-3">
                <div class="product-card">
                    <img src="${product.image}" alt="${product.name}" class="img-fluid">
                    <h4>${product.name}</h4>
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="price">${product.price}₽</span>
                        <button class="btn btn-primary btn-sm" onclick="addToCart('${product.id}')">В корзину</button>
                    </div>
                </div>
            </div>
        `;
    });
}

// Добавление товара в корзину
function addToCart(productId) {
    let product = findProduct(productId);
    if (product) {
        cart.push(product);
        updateCartCount();
        tg.HapticFeedback.impactOccurred('light');
    }
}

// Поиск товара по ID
function findProduct(productId) {
    for (let category in products) {
        let product = products[category].find(p => p.id === productId);
        if (product) return product;
    }
    return null;
}

// Обновление счетчика корзины
function updateCartCount() {
    document.getElementById('cartCount').textContent = cart.length;
}

// Показать корзину
function showCart() {
    const cartModal = new bootstrap.Modal(document.getElementById('cartModal'));
    const cartItems = document.getElementById('cartItems');
    cartItems.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        total += item.price;
        cartItems.innerHTML += `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <div>
                    <h6 class="mb-0">${item.name}</h6>
                    <small class="text-muted">${item.price}₽</small>
                </div>
                <button class="btn btn-danger btn-sm" onclick="removeFromCart(${index})">Удалить</button>
            </div>
        `;
    });

    document.getElementById('totalPrice').textContent = total;
    cartModal.show();
}

// Удаление товара из корзины
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartCount();
    showCart();
    tg.HapticFeedback.impactOccurred('light');
}

// Оформление заказа
function checkout() {
    if (cart.length === 0) {
        tg.showPopup({
            title: 'Ошибка',
            message: 'Корзина пуста',
            buttons: [{type: 'ok'}]
        });
        return;
    }

    let total = cart.reduce((sum, item) => sum + item.price, 0);
    
    tg.sendData(JSON.stringify({
        action: 'checkout',
        items: cart,
        total: total
    }));

    cart = [];
    updateCartCount();
    bootstrap.Modal.getInstance(document.getElementById('cartModal')).hide();
} 