// Shopping Cart functionality
const cart = {
    items: [],
    total: 0,
    deliveryCost: 0,
    deliveryZone: 'moscow',

    init() {
        this.loadCart();
        this.bindEvents();
        this.updateCart();
    },

    bindEvents() {
        // Обработчик клика по кнопке корзины
        document.querySelector('.cart').addEventListener('click', () => this.toggleCart());
        
        // Обработчик закрытия корзины
        document.querySelector('.close-cart').addEventListener('click', () => this.toggleCart());
        
        // Обработчик клика вне корзины
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.cart-modal') && !e.target.closest('.cart')) {
                document.querySelector('.cart-modal').classList.remove('active');
            }
        });

        // Обработчик изменения зоны доставки
        document.addEventListener('change', (e) => {
            if (e.target.id === 'delivery-zone') {
                this.deliveryZone = e.target.value;
                this.calculateDelivery();
                this.updateCart();
            }
        });

        // Обработчик добавления в корзину
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart')) {
        const productCard = e.target.closest('.product-card');
        const product = {
                    id: Date.now(),
            name: productCard.querySelector('h3').textContent,
                    price: parseInt(productCard.querySelector('.price').textContent.replace(/[^\d]/g, '')),
            quantity: 1
        };
                this.addItem(product);
            }
        });
    },

    addItem(product) {
        const existingItem = this.items.find(item => item.name === product.name);
        if (existingItem) {
            existingItem.quantity = 1; // Всегда добавляем только 1 штуку
    } else {
            this.items.push(product);
        }
        this.updateCart();
        this.showNotification('Товар добавлен в корзину');
    },

    removeItem(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.updateCart();
    },

    updateQuantity(id, quantity) {
        const item = this.items.find(item => item.id === id);
        if (item) {
            item.quantity = quantity;
            if (item.quantity <= 0) {
                this.removeItem(id);
            } else {
                this.updateCart();
            }
        }
    },

    updateCart() {
        this.calculateTotal();
        this.calculateDelivery();
        this.updateCartCount();
        this.renderCart();
        this.saveCart();
    },

    calculateTotal() {
        this.total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },

    calculateDelivery() {
        const orderTotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        if (orderTotal >= 5000) {
            this.deliveryCost = 0;
        } else {
            switch(this.deliveryZone) {
                case 'moscow':
                    this.deliveryCost = 300;
                    break;
                case 'near-moscow':
                    this.deliveryCost = 500;
                    break;
                case 'far-moscow':
                    this.deliveryCost = 800;
                    break;
                default:
                    this.deliveryCost = 300;
            }
        }
    },

    updateCartCount() {
        const count = this.items.reduce((sum, item) => sum + item.quantity, 0);
        document.querySelector('.cart-count').textContent = count;
    },

    toggleCart() {
        document.querySelector('.cart-modal').classList.toggle('active');
    },

    renderCart() {
        const cartItems = document.querySelector('.cart-items');
        if (!cartItems) return;

        if (this.items.length === 0) {
            cartItems.innerHTML = '<div class="empty-cart">Ваша корзина пуста</div>';
        } else {
            cartItems.innerHTML = this.items.map(item => `
                <div class="cart-item" data-id="${item.id}">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p class="cart-item-price">${item.price} ₽</p>
                    </div>
                    <div class="cart-item-quantity">
                <button class="quantity-btn minus">-</button>
                <span>${item.quantity}</span>
                <button class="quantity-btn plus">+</button>
            </div>
                    <button class="remove-item">&times;</button>
        </div>
    `).join('');
        }

        // Обновляем итоговые суммы
        const cartTotal = document.querySelector('.cart-total-amount');
        const deliveryCost = document.querySelector('.delivery-cost');
        const finalTotal = document.querySelector('.final-total');

        if (cartTotal) cartTotal.textContent = `${this.total} ₽`;
        if (deliveryCost) deliveryCost.textContent = `${this.deliveryCost} ₽`;
        if (finalTotal) finalTotal.textContent = `${this.total + this.deliveryCost} ₽`;

        // Обновляем счетчик товаров в корзине
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            cartCount.textContent = this.items.reduce((sum, item) => sum + item.quantity, 0);
        }

        // Обновляем состояние формы доставки
        const deliveryForm = document.querySelector('.delivery-form');
        if (deliveryForm) {
            deliveryForm.style.display = this.items.length > 0 ? 'block' : 'none';
        }

        this.bindCartItemEvents();
    },

    bindCartItemEvents() {
        document.querySelectorAll('.cart-item').forEach(item => {
            const id = parseInt(item.dataset.id);
            
            item.querySelector('.minus').addEventListener('click', () => {
                const currentQuantity = parseInt(item.querySelector('.quantity-btn + span').textContent);
                this.updateQuantity(id, currentQuantity - 1);
            });

            item.querySelector('.plus').addEventListener('click', () => {
                const currentQuantity = parseInt(item.querySelector('.quantity-btn + span').textContent);
                this.updateQuantity(id, currentQuantity + 1);
            });

            item.querySelector('.remove-item').addEventListener('click', () => {
                this.removeItem(id);
                this.showNotification('Товар удален из корзины');
        });
    });
    },

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    },

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    },

    loadCart() {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            this.items = JSON.parse(savedCart);
        }
    }
};

// Добавляем объект для управления избранным
const favorites = {
    items: [],

    init() {
        this.loadFavorites();
        this.bindEvents();
    },

    bindEvents() {
        // Обработчик добавления в избранное
document.addEventListener('click', (e) => {
            if (e.target.closest('.add-to-favorites')) {
                const productCard = e.target.closest('.product-card');
                if (!productCard) return;

                const product = {
                    id: Date.now(),
                    name: productCard.querySelector('h3').textContent,
                    price: productCard.querySelector('.price').textContent,
                    image: productCard.querySelector('img').src,
                    category: productCard.dataset.category
                };

                this.addItem(product);
            }
        });
    },

    addItem(product) {
        // Проверяем, не существует ли уже такой товар в избранном
        const isDuplicate = this.items.some(item => item.name === product.name);
        
        if (isDuplicate) {
            cart.showNotification('Товар уже в избранном');
            return;
        }

        this.items.push(product);
        this.saveFavorites();
        this.renderFavorites();
        cart.showNotification('Товар добавлен в избранное');
    },

    removeItem(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.saveFavorites();
        this.renderFavorites();
        cart.showNotification('Товар удален из избранного');
    },

    saveFavorites() {
        localStorage.setItem('favorites', JSON.stringify(this.items));
    },

    loadFavorites() {
        const savedFavorites = localStorage.getItem('favorites');
        if (savedFavorites) {
            this.items = JSON.parse(savedFavorites);
            this.renderFavorites();
        }
    },

    renderFavorites() {
        const favoritesContainer = document.querySelector('.favorites-container');
        if (!favoritesContainer) return;

        if (this.items.length === 0) {
            favoritesContainer.innerHTML = '<p>У вас пока нет избранных товаров</p>';
    } else {
            favoritesContainer.innerHTML = this.items.map(item => `
                <div class="favorite-item" data-id="${item.id}">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="favorite-item-info">
                        <h3>${item.name}</h3>
                        <p class="price">${item.price}</p>
                    </div>
                    <button class="remove-from-favorites" title="Удалить из избранного">&times;</button>
                </div>
            `).join('');

            // Добавляем обработчики для кнопок удаления
            document.querySelectorAll('.remove-from-favorites').forEach(button => {
                button.addEventListener('click', (e) => {
                    const item = e.target.closest('.favorite-item');
                    if (item) {
                        this.removeItem(parseInt(item.dataset.id));
                    }
                });
            });
        }
    }
};

// Объект с контентом страниц
const pages = {
    'index': {
        title: 'Цветочный магазин',
        content: `
            <section class="hero">
                <video class="hero-video" autoplay muted loop playsinline>
                    <source src="mixkit-watering-a-flower-pot-1780-hd-ready.mp4" type="video/mp4">
                </video>
                <div class="hero-content">
                    <h1>Доставка цветов в Москве</h1>
                    <p>Бесплатная доставка при заказе от 5000₽</p>
                    <a href="#catalog" class="cta-button">Перейти в каталог</a>
                </div>
            </section>

            <section class="popular-products">
                <div class="container">
                    <h2>Популярные букеты</h2>
                    <div class="products-grid">
                        <!-- Популярные товары будут загружаться здесь -->
                    </div>
                </div>
            </section>

            <section class="advantages">
                <div class="container">
                    <h2>Наши преимущества</h2>
                    <div class="advantages-grid">
                        <div class="advantage-card">
                            <i class="fas fa-truck"></i>
                            <h3>Бесплатная доставка</h3>
                            <p>При заказе от 5000₽</p>
                        </div>
                        <div class="advantage-card">
                            <i class="fas fa-gift"></i>
                            <h3>Открытка в подарок</h3>
                            <p>К каждому букету</p>
                        </div>
                        <div class="advantage-card">
                            <i class="fas fa-shield-alt"></i>
                            <h3>Гарантия качества</h3>
                            <p>Свежие цветы</p>
                        </div>
                        <div class="advantage-card">
                            <i class="fas fa-clock"></i>
                            <h3>Доставка 24/7</h3>
                            <p>В любое время</p>
                        </div>
                    </div>
                </div>
            </section>
        `
    },
    'about': {
        title: 'О нас - Цветочный магазин',
        content: `
            <section class="about-page">
                <div class="container">
                    <h1>О нашей компании</h1>
                    <div class="about-content">
                        <div class="about-text">
                            <h2>Мы - ваш надежный цветочный магазин</h2>
                            <p>Наша компания работает на рынке цветочной индустрии более 10 лет. За это время мы заслужили доверие тысяч клиентов и стали одним из ведущих поставщиков цветов в Москве.</p>
                            
                            <h3>Наши преимущества:</h3>
                            <ul>
                                <li>Свежие цветы каждый день</li>
                                <li>Профессиональные флористы</li>
                                <li>Быстрая доставка</li>
                                <li>Гарантия качества</li>
                                <li>Индивидуальный подход к каждому клиенту</li>
                            </ul>

                            <h3>Наша миссия:</h3>
                            <p>Мы стремимся делать мир прекраснее, доставляя радость и красоту в каждый дом. Наши букеты - это не просто цветы, это эмоции, чувства и особые моменты в жизни наших клиентов.</p>
                        </div>
                        <div class="about-image">
                            <img src="https://via.placeholder.com/600x400" alt="Наш магазин">
                        </div>
                    </div>
                </div>
            </section>
        `
    },
    'catalog': {
        title: 'Каталог - Цветочный магазин',
        content: `
            <section class="catalog-page">
                <div class="container">
                    <h1>Каталог товаров</h1>
                    
                    <div class="filters">
                        <div class="filter-group">
                            <h3>Категории</h3>
                            <ul>
                                <li><a href="#" data-category="all" class="active">Все цветы</a></li>
                                <li><a href="#" data-category="roses">Розы</a></li>
                                <li><a href="#" data-category="tulips">Тюльпаны</a></li>
                                <li><a href="#" data-category="peonies">Пионы</a></li>
                                <li><a href="#" data-category="bouquets">Букеты</a></li>
                                <li><a href="#" data-category="lilies">Лилии</a></li>
                                <li><a href="#" data-category="orchids">Орхидеи</a></li>
                            </ul>
                        </div>
                        <div class="filter-group">
                            <h3>Цена</h3>
                            <div class="price-range">
                                <input type="range" min="0" max="20000" value="10000">
                                <div class="price-inputs">
                                    <input type="number" placeholder="От" min="0" value="0">
                                    <input type="number" placeholder="До" max="20000" value="20000">
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="products-grid">
                        <!-- Товары будут загружаться здесь динамически -->
                    </div>

                    <div class="pagination">
                        <!-- Пагинация будет загружаться здесь динамически -->
                    </div>
                </div>
            </section>
        `
    },
    'delivery': {
        title: 'Доставка - Цветочный магазин',
        content: `
            <section class="delivery-page">
                <div class="container">
                    <h1>Доставка цветов</h1>
                    
                    <div class="delivery-content">
                        <div class="delivery-info">
                            <h2>Условия доставки</h2>
                            <div class="delivery-card">
                                <i class="fas fa-truck"></i>
                                <h3>Бесплатная доставка</h3>
                                <p>При заказе от 5000₽ доставка бесплатная</p>
                            </div>
                            <div class="delivery-card">
                                <i class="fas fa-clock"></i>
                                <h3>Время доставки</h3>
                                <p>Доставка осуществляется ежедневно с 9:00 до 21:00</p>
                            </div>
                            <div class="delivery-card">
                                <i class="fas fa-map-marker-alt"></i>
                                <h3>Зона доставки</h3>
                                <p>Доставляем по всей Москве и ближайшему Подмосковью</p>
                            </div>
                        </div>

                        <div class="delivery-terms">
                            <h2>Как заказать доставку?</h2>
                            <ol>
                                <li>Выберите букет в каталоге</li>
                                <li>Добавьте его в корзину</li>
                                <li>Укажите адрес доставки</li>
                                <li>Выберите удобное время</li>
                                <li>Оплатите заказ</li>
                            </ol>

                            <h2>Стоимость доставки</h2>
                            <table class="delivery-table">
                                <tr>
                                    <th>Зона доставки</th>
                                    <th>Стоимость</th>
                                </tr>
                                <tr>
                                    <td>В пределах МКАД</td>
                                    <td>300₽</td>
                                </tr>
                                <tr>
                                    <td>За МКАД до 10 км</td>
                                    <td>500₽</td>
                                </tr>
                                <tr>
                                    <td>За МКАД от 10 км</td>
                                    <td>800₽</td>
                                </tr>
                            </table>
                        </div>
                    </div>
                </div>
            </section>
        `
    },
    'reviews': {
        title: 'Отзывы - Цветочный магазин',
        content: `
            <section class="reviews-page">
                <div class="container">
                    <h1>Отзывы наших клиентов</h1>

                    <div class="reviews-stats">
                        <div class="rating-overall">
                            <div class="rating-number">4.8</div>
                            <div class="rating-stars">
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star-half-alt"></i>
                            </div>
                            <div class="rating-count">На основе 156 отзывов</div>
                        </div>
                    </div>

                    <div class="reviews-grid">
                        <div class="review-card">
                            <div class="review-header">
                                <div class="reviewer-info">
                                    <img src="https://via.placeholder.com/50" alt="Анна">
                                    <div>
                                        <h3>Анна</h3>
                                        <div class="review-date">15.03.2024</div>
                                    </div>
                                </div>
                                <div class="review-rating">
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                </div>
                            </div>
                            <p class="review-text">Заказывала букет "Персиковый Жемчуг" для мамы на 8 марта. Букет пришел точно в срок, цветы были свежие и красивые. Мама в восторге! Спасибо за отличный сервис!</p>
                        </div>

                        <div class="review-card">
                            <div class="review-header">
                                <div class="reviewer-info">
                                    <img src="https://via.placeholder.com/50" alt="Михаил">
                                    <div>
                                        <h3>Михаил</h3>
                                        <div class="review-date">10.03.2024</div>
                                    </div>
                                </div>
                                <div class="review-rating">
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                </div>
                            </div>
                            <p class="review-text">Отличный сервис! Заказал букет для жены на годовщину свадьбы. Доставили вовремя, цветы свежие, упаковка красивая. Рекомендую!</p>
                        </div>

                        <div class="review-card">
                            <div class="review-header">
                                <div class="reviewer-info">
                                    <img src="https://via.placeholder.com/50" alt="Елена">
                                    <div>
                                        <h3>Елена</h3>
                                        <div class="review-date">05.03.2024</div>
                                    </div>
                                </div>
                                <div class="review-rating">
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="far fa-star"></i>
                                </div>
                            </div>
                            <p class="review-text">Заказывала букет "Рубиновые Розы". Цветы красивые, но немного задержалась доставка. В целом осталась довольна.</p>
                        </div>
                    </div>

                    <div class="add-review">
                        <h2>Оставить отзыв</h2>
                        <form class="review-form">
                            <div class="form-group">
                                <label for="name">Ваше имя</label>
                                <input type="text" id="name" required>
                            </div>
                            <div class="form-group">
                                <label for="rating">Оценка</label>
                                <div class="rating-select">
                                    <i class="far fa-star" data-rating="1"></i>
                                    <i class="far fa-star" data-rating="2"></i>
                                    <i class="far fa-star" data-rating="3"></i>
                                    <i class="far fa-star" data-rating="4"></i>
                                    <i class="far fa-star" data-rating="5"></i>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="review">Ваш отзыв</label>
                                <textarea id="review" rows="5" required></textarea>
                            </div>
                            <button type="submit" class="submit-review">Отправить отзыв</button>
                        </form>
                    </div>
                </div>
            </section>
        `
    },
    'contacts': {
        title: 'Контакты - Цветочный магазин',
        content: `
            <section class="contacts-page">
                <div class="container">
                    <h1>Контакты</h1>

                    <div class="contacts-content">
                        <div class="contact-info">
                            <div class="contact-card">
                                <i class="fas fa-map-marker-alt"></i>
                                <h3>Адрес</h3>
                                <p>г. Москва, ул. Цветочная, д. 1</p>
                                <p>БЦ "Флора", 3 этаж</p>
                            </div>

                            <div class="contact-card">
                                <i class="fas fa-phone"></i>
                                <h3>Телефон</h3>
                                <p>1234567890</p>
                                <p>+7 (495) 123-45-67</p>
                            </div>

                            <div class="contact-card">
                                <i class="fas fa-envelope"></i>
                                <h3>Email</h3>
                                <p>flower@mail.ru</p>
                                <p>support@flowershop.ru</p>
                            </div>

                            <div class="contact-card">
                                <i class="fas fa-clock"></i>
                                <h3>Режим работы</h3>
                                <p>Пн-Пт: 9:00 - 21:00</p>
                                <p>Сб-Вс: 10:00 - 20:00</p>
                            </div>
                        </div>

                        <div class="contact-form-container">
                            <h2>Напишите нам</h2>
                            <form class="contact-form">
                                <div class="form-group">
                                    <label for="name">Ваше имя</label>
                                    <input type="text" id="name" required>
                                </div>
                                <div class="form-group">
                                    <label for="email">Email</label>
                                    <input type="email" id="email" required>
                                </div>
                                <div class="form-group">
                                    <label for="phone">Телефон</label>
                                    <input type="tel" id="phone">
                                </div>
                                <div class="form-group">
                                    <label for="message">Сообщение</label>
                                    <textarea id="message" rows="5" required></textarea>
                                </div>
                                <button type="submit" class="submit-button">Отправить</button>
                            </form>
                        </div>
                    </div>

                    <div class="map-container">
                        <h2>Как нас найти</h2>
                        <div class="map">
                            <!-- Карта будет загружаться здесь динамически -->
                        </div>
                    </div>
                </div>
            </section>
        `
    },
    'cart': {
        title: 'Корзина - Цветочный магазин',
        content: `
            <section class="cart-page">
                <div class="container">
                    <h1>Корзина</h1>
                    
                    <div class="cart-content">
                        <div class="cart-items-container">
                            <div class="cart-items">
                                <!-- Cart items will be dynamically added here -->
                            </div>
                        </div>
                        
                        <div class="cart-summary">
                            <div class="delivery-form">
                                <h2>Доставка</h2>
                                <div class="form-group">
                                    <label for="address">Адрес доставки</label>
                                    <input type="text" id="address" placeholder="Введите адрес доставки" required>
                                </div>
                                <div class="form-group">
                                    <label for="delivery-zone">Зона доставки</label>
                                    <select id="delivery-zone">
                                        <option value="moscow">В пределах МКАД</option>
                                        <option value="near-moscow">За МКАД до 10 км</option>
                                        <option value="far-moscow">За МКАД от 10 км</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="order-summary">
                                <h2>Итого</h2>
                                <div class="summary-row">
                                    <span>Товары:</span>
                                    <span class="cart-total-amount">0 ₽</span>
                                </div>
                                <div class="summary-row">
                                    <span>Доставка:</span>
                                    <span class="delivery-cost">0 ₽</span>
                                </div>
                                <div class="summary-row total">
                                    <span>К оплате:</span>
                                    <span class="final-total">0 ₽</span>
                                </div>
                                <button class="checkout-button">Оформить заказ</button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `
    },
    'account': {
        title: 'Личный кабинет - Цветочный магазин',
        content: `
            <section class="account-page">
                <div class="container">
                    <h1>Личный кабинет</h1>
                    <div class="account-content">
                        <div class="account-sidebar">
                            <ul class="account-menu">
                                <li><a href="#" data-section="orders" class="active">Мои заказы</a></li>
                                <li><a href="#" data-section="profile">Личные данные</a></li>
                                <li><a href="#" data-section="addresses">Адреса доставки</a></li>
                                <li><a href="#" data-section="favorites">Избранное</a></li>
                            </ul>
                        </div>
                        <div class="account-main">
                            <div class="account-section orders-section">
                                <h2>Мои заказы</h2>
                                <div class="orders-list">
                                    <p>У вас пока нет заказов</p>
                                </div>
                            </div>
                            <div class="account-section profile-section" style="display: none;">
                                <h2>Личные данные</h2>
                                <form class="profile-form">
                                    <div class="form-group">
                                        <label for="profile-name">Имя</label>
                                        <input type="text" id="profile-name" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="profile-email">Email</label>
                                        <input type="email" id="profile-email" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="profile-phone">Телефон</label>
                                        <input type="tel" id="profile-phone" required>
                                    </div>
                                    <button type="submit" class="save-profile">Сохранить</button>
                                </form>
                            </div>
                            <div class="account-section addresses-section" style="display: none;">
                                <h2>Адреса доставки</h2>
                                <form class="address-form">
                                    <div class="form-group">
                                        <label for="address-name">Название адреса</label>
                                        <input type="text" id="address-name" placeholder="Например: Дом" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="address-full">Адрес</label>
                                        <input type="text" id="address-full" required>
                                    </div>
                                    <button type="submit" class="add-address">Добавить адрес</button>
                                </form>
                                <div class="addresses-list">
                                    <p>У вас пока нет сохраненных адресов</p>
                                </div>
                            </div>
                            <div class="account-section favorites-section" style="display: none;">
                                <h2>Избранное</h2>
                                <div class="favorites-container">
                                    <!-- Избранные товары будут добавлены динамически -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `
    }
};

// Добавляем объект для управления личными данными
const userProfile = {
    data: {
        name: '',
        email: '',
        phone: ''
    },
    addresses: [],

    init() {
        this.loadProfile();
        this.loadAddresses();
        this.bindEvents();
    },

    bindEvents() {
        // Обработчик сохранения личных данных
        document.addEventListener('submit', (e) => {
            if (e.target.classList.contains('profile-form')) {
    e.preventDefault();
                this.saveProfileData();
            }
            if (e.target.classList.contains('address-form')) {
                e.preventDefault();
                this.addAddress();
            }
        });

        // Обработчик удаления адреса
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-address')) {
                const addressItem = e.target.closest('.address-item');
                if (addressItem) {
                    const id = parseInt(addressItem.dataset.id);
                    this.removeAddress(id);
                }
            }
        });
    },

    saveProfileData() {
        const name = document.getElementById('profile-name').value;
        const email = document.getElementById('profile-email').value;
        const phone = document.getElementById('profile-phone').value;

        this.data = { name, email, phone };
        localStorage.setItem('userProfile', JSON.stringify(this.data));
        cart.showNotification('Личные данные сохранены');
    },

    addAddress() {
        const name = document.getElementById('address-name').value.trim();
        const address = document.getElementById('address-full').value.trim();

        // Не добавлять, если поля пустые или только пробелы
        if (!name || !address) {
            cart.showNotification('Пожалуйста, заполните все поля');
        return;
    }
    
        // Проверяем, не существует ли уже такой адрес
        const isDuplicate = this.addresses.some(addr => 
            addr.name === name && addr.address === address
        );

        if (isDuplicate) {
            cart.showNotification('Такой адрес уже существует');
            return;
        }

        const newAddress = {
            id: Date.now(),
            name,
            address
        };

        this.addresses.push(newAddress);
        this.saveAddresses();
        this.renderAddresses();
        cart.showNotification('Адрес добавлен');

        // Очищаем форму
        document.getElementById('address-name').value = '';
        document.getElementById('address-full').value = '';
    },

    removeAddress(id) {
        this.addresses = this.addresses.filter(addr => addr.id !== id);
        this.saveAddresses();
        this.renderAddresses();
        cart.showNotification('Адрес удален');
    },

    saveAddresses() {
        localStorage.setItem('userAddresses', JSON.stringify(this.addresses));
    },

    loadProfile() {
        const savedProfile = localStorage.getItem('userProfile');
        if (savedProfile) {
            this.data = JSON.parse(savedProfile);
            this.renderProfile();
        }
    },

    loadAddresses() {
        const savedAddresses = localStorage.getItem('userAddresses');
        if (savedAddresses) {
            this.addresses = JSON.parse(savedAddresses);
            this.renderAddresses();
        }
    },

    renderProfile() {
        const nameInput = document.getElementById('profile-name');
        const emailInput = document.getElementById('profile-email');
        const phoneInput = document.getElementById('profile-phone');

        if (nameInput) nameInput.value = this.data.name;
        if (emailInput) emailInput.value = this.data.email;
        if (phoneInput) phoneInput.value = this.data.phone;
    },

    renderAddresses() {
        const addressesList = document.querySelector('.addresses-list');
        if (!addressesList) return;

        if (this.addresses.length === 0) {
            addressesList.innerHTML = '<p>У вас пока нет сохраненных адресов</p>';
        } else {
            addressesList.innerHTML = this.addresses.map(addr => `
                <div class="address-item" data-id="${addr.id}">
                    <div class="address-info">
                        <strong>${addr.name}</strong>
                        <p>${addr.address}</p>
                    </div>
                    <button class="remove-address">Удалить</button>
                </div>
            `).join('');
        }
    }
};

// Функция для отображения популярных букетов на главной странице
function renderPopularProducts() {
    const popularProductsGrid = document.querySelector('.popular-products .products-grid');
    if (!popularProductsGrid) return;

    // Выбираем конкретные букеты по их названиям
    const popularProducts = productsData.filter(product => 
        product.name === "Букет 'Пионовый Рай'" ||
        product.name === "Букет 'Летний Микс'" ||
        product.name === "Букет 'Садовые Розы'"
    );

    // Обновляем пути к изображениям
    popularProducts.forEach(product => {
        switch(product.name) {
            case "Букет 'Пионовый Рай'":
                product.image = "images/pionoviy_ray.webp";
                break;
            case "Букет 'Летний Микс'":
                product.image = "images/letniy_mix.webp";
                break;
            case "Букет 'Садовые Розы'":
                product.image = "images/sadovie_rosi.webp";
                break;
        }
    });

    popularProductsGrid.innerHTML = popularProducts.map(productCardTemplate).join('');
}

// Функция для загрузки страницы
function loadPage(pageId) {
    const page = pages[pageId];
    if (page) {
        document.title = page.title;
        document.querySelector('main').innerHTML = page.content;
        
        // Обновляем активную ссылку в навигации
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${pageId}`) {
                link.classList.add('active');
            }
        });

        // Если загружается главная страница, отображаем популярные букеты
        if (pageId === 'index') {
            renderPopularProducts();
        }

        // Если загружается страница каталога, рендерим товары
        if (pageId === 'catalog') {
            renderProducts();
            // Инициализируем ползунок цены
            const priceRangeInput = document.querySelector('.price-range input[type="range"]');
            const minPriceInput = document.querySelector('.price-inputs input[placeholder="От"]');
            const maxPriceInput = document.querySelector('.price-inputs input[placeholder="До"]');

            if (priceRangeInput && minPriceInput && maxPriceInput) {
                priceRangeInput.value = 10000;
                minPriceInput.value = 0;
                maxPriceInput.value = 20000;
            }
        }

        // Если загружается страница личного кабинета
        if (pageId === 'account') {
            favorites.renderFavorites();
            userProfile.renderProfile();
            userProfile.renderAddresses();
            bindAccountEvents(); // Добавляем привязку событий для аккаунта
        }

        // Если загружается страница корзины, обновляем её содержимое
        if (pageId === 'cart') {
            cart.renderCart();
        }

        // Если загружается страница контактов, инициализируем карту
        if (pageId === 'contacts') {
            initMap();
        }

        // Прокручиваем страницу вверх
        window.scrollTo(0, 0);

        // Перепривязываем обработчики событий после загрузки нового контента
        bindGlobalEventListeners();
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    cart.init();
    favorites.init();
    userProfile.init();
    // Загружаем страницу на основе хэша в URL
    const hash = window.location.hash.slice(1) || 'index';
    loadPage(hash);

    // Все глобальные обработчики событий должны быть здесь, чтобы их можно было перепривязать
    bindGlobalEventListeners();

    // Обработчик изменения хэша в URL
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.slice(1) || 'index';
        loadPage(hash);
    });
});

// Глобальная функция для привязки событий
function bindGlobalEventListeners() {
    // Обработчик клика по ссылкам навигации
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.removeEventListener('click', handleNavLinkClick); // Удаляем старый обработчик
        link.addEventListener('click', handleNavLinkClick); // Добавляем новый
    });

    function handleNavLinkClick(e) {
        e.preventDefault();
        const pageId = e.target.getAttribute('href').replace('#', '');
        loadPage(pageId);
        history.pushState(null, '', `#${pageId}`);
    }

    // Обработчик рейтинга в форме отзыва
    document.querySelectorAll('.rating-select i').forEach(star => {
        star.removeEventListener('click', handleRatingClick); // Удаляем старый
        star.addEventListener('click', handleRatingClick); // Добавляем новый
    });

    function handleRatingClick(e) {
        const rating = parseInt(e.target.dataset.rating);
        const stars = e.target.parentNode.querySelectorAll('i');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.remove('far');
                star.classList.add('fas');
            } else {
                star.classList.remove('fas');
                star.classList.add('far');
            }
        });
    }

    // Обработчик отправки отзыва
    document.querySelectorAll('.review-form').forEach(form => {
        form.removeEventListener('submit', handleReviewSubmit); // Удаляем старый
        form.addEventListener('submit', handleReviewSubmit); // Добавляем новый
    });

    function handleReviewSubmit(e) {
        e.preventDefault();
        const name = e.target.querySelector('#name').value;
        const rating = e.target.querySelector('.rating-select i.fas')?.dataset.rating || 0;
        const review = e.target.querySelector('#review').value;
        
        if (!rating) {
            cart.showNotification('Пожалуйста, выберите оценку');
            return;
        }
        
        cart.showNotification('Спасибо за ваш отзыв! Он будет опубликован после проверки.');
        e.target.reset();
        
        e.target.querySelectorAll('.rating-select i').forEach(star => {
            star.classList.remove('fas');
            star.classList.add('far');
        });
    }

    // Обработчик функционала поиска
    document.querySelectorAll('.search input').forEach(input => {
        input.removeEventListener('input', handleSearchInput); // Удаляем старый
        input.addEventListener('input', handleSearchInput); // Добавляем новый
    });

    function handleSearchInput(e) {
        const searchTerm = e.target.value.toLowerCase();
        const products = document.querySelectorAll('.product-card');
        
        products.forEach(product => {
            const productName = product.querySelector('h3').textContent.toLowerCase();
            if (productName.includes(searchTerm)) {
                product.style.display = 'block';
            } else {
                product.style.display = 'none';
            }
        });
    }

    // Обработчик фильтрации по категориям
    document.querySelectorAll('.filter-group a').forEach(link => {
        link.removeEventListener('click', handleCategoryFilterClick); // Удаляем старый
        link.addEventListener('click', handleCategoryFilterClick); // Добавляем новый
    });

    function handleCategoryFilterClick(e) {
        e.preventDefault();
        const category = e.target.dataset.category;
        
        document.querySelectorAll('.filter-group a').forEach(link => {
            link.classList.remove('active');
        });
        e.target.classList.add('active');

        // Рендерим товары с учетом новой категории
        const currentMinPrice = parseInt(document.querySelector('.price-inputs input[placeholder="От"]').value) || 0;
        const currentMaxPrice = parseInt(document.querySelector('.price-inputs input[placeholder="До"]').value) || 20000;
        renderProducts(category, currentMinPrice, currentMaxPrice, 1); // Сбрасываем пагинацию на 1 страницу
    }

    // Обработчик фильтрации по ценам
    document.querySelectorAll('.price-inputs input').forEach(input => {
        input.removeEventListener('input', handlePriceFilterInput); // Удаляем старый
        input.addEventListener('input', handlePriceFilterInput); // Добавляем новый
    });

    function handlePriceFilterInput(e) {
        const minPrice = parseInt(document.querySelector('.price-inputs input[placeholder="От"]').value) || 0;
        const maxPrice = parseInt(document.querySelector('.price-inputs input[placeholder="До"]').value) || 20000;
        
        // Рендерим товары с учетом нового диапазона цен
        const currentCategory = document.querySelector('.filter-group a.active')?.dataset.category || 'all';
        renderProducts(currentCategory, minPrice, maxPrice, 1); // Сбрасываем пагинацию на 1 страницу
    }

    // Обработчик оформления заказа
    document.querySelectorAll('.checkout-button').forEach(button => {
        button.removeEventListener('click', handleCheckoutClick); // Удаляем старый
        button.addEventListener('click', handleCheckoutClick); // Добавляем новый
    });

    function handleCheckoutClick(e) {
        e.preventDefault();
        if (cart.items.length === 0) {
            cart.showNotification('Корзина пуста');
            return;
        }

        cart.items = [];
        cart.updateCart();
        
        cart.showNotification('Заказ успешно оформлен! Наш менеджер свяжется с вами в ближайшее время.');
        
        setTimeout(() => {
            loadPage('index');
        }, 2000);
    }

    // Обработчик отправки формы обратной связи (контакты)
    document.querySelectorAll('.contact-form').forEach(form => {
        form.removeEventListener('submit', handleContactFormSubmit); // Удаляем старый
        form.addEventListener('submit', handleContactFormSubmit); // Добавляем новый
    });

    function handleContactFormSubmit(e) {
        e.preventDefault();
        cart.showNotification('Спасибо за ваше сообщение! Мы свяжемся с вами в ближайшее время.');
        e.target.reset();
    }
}

// Инициализация Яндекс.Карты
function initMap() {
    if (document.getElementById('map')) {
        ymaps.ready(function () {
            // Точные координаты: г. Москва, ул. Цветочная, д. 1
            const coords = [55.723710, 37.653258];
            const map = new ymaps.Map('map', {
                center: coords,
                zoom: 17
            });

            const placemark = new ymaps.Placemark(coords, {
                balloonContent: 'г. Москва, ул. Цветочная, д. 1<br>БЦ "Флора", 3 этаж'
            });

            map.geoObjects.add(placemark);
        });
    }
}

// Добавляем скрипт Яндекс.Карт
const script = document.createElement('script');
script.src = 'https://api-maps.yandex.ru/2.1/?apikey=ваш_API_ключ&lang=ru_RU';
script.onload = initMap;
document.head.appendChild(script); 

// Обновляем шаблон карточки товара в каталоге
const productCardTemplate = (product) => `
    <div class="product-card" data-category="${product.category}" data-id="${product.id}">
        <div class="product-image">
            <img src="${product.image}" alt="${product.name}">
            <button class="add-to-favorites" title="Добавить в избранное" data-product-id="${product.id}">
                <i class="far fa-heart"></i>
            </button>
            ${product.tags ? `
                <div class="product-tags">
                    ${product.tags.map(tag => `<span class="tag ${tag.type}">${tag.text}</span>`).join('')}
                </div>
            ` : ''}
        </div>
        <div class="product-info">
            <h3>${product.name}</h3>
            <p class="price">${product.price} ₽</p>
            <button class="add-to-cart" data-product-id="${product.id}">В корзину</button>
        </div>
    </div>
`; 

// Данные о товарах
const productsData = [
    // Розы
    { id: 1, name: "Букет 'Красные Розы'", category: "roses", price: 3990, image: "images/rose_1.webp", tags: [] },
    { id: 2, name: "Букет 'Розовые Розы'", category: "roses", price: 4490, image: "images/rose_2.webp", tags: [] },
    { id: 3, name: "Букет 'Белые Розы'", category: "roses", price: 6990, image: "images/rose_3.webp", tags: [] },
    { id: 4, name: "Букет 'Желтые Розы'", category: "roses", price: 5490, image: "images/rose_4.webp", tags: [] },
    { id: 5, name: "Букет 'Оранжевые Розы'", category: "roses", price: 5990, image: "images/rose_5.webp", tags: [] },
    { id: 6, name: "Букет 'Фиолетовые Розы'", category: "roses", price: 6490, image: "images/rose_6.webp", tags: [] },
    { id: 7, name: "Букет 'Черные Розы'", category: "roses", price: 7990, image: "images/rose_7.webp", tags: [] },
    { id: 8, name: "Букет 'Радужные Розы'", category: "roses", price: 8990, image: "images/rose_8.webp", tags: [] },
    { id: 9, name: "Букет 'Кремовые Розы'", category: "roses", price: 5990, image: "images/rose_9.webp", tags: [] },
    { id: 10, name: "Букет 'Бордовые Розы'", category: "roses", price: 5590, image: "images/rose_10.webp", tags: [] },

    // Тюльпаны
    { id: 11, name: "Букет 'Красные Тюльпаны'", category: "tulips", price: 2990, image: "https://via.placeholder.com/300/FF0000/FFFFFF?text=Red+Tulip", tags: [] },
    { id: 12, name: "Букет 'Желтые Тюльпаны'", category: "tulips", price: 3490, image: "https://via.placeholder.com/300/FFFF00/000000?text=Yellow+Tulip", tags: [] },
    { id: 13, name: "Букет 'Белые Тюльпаны'", category: "tulips", price: 5490, image: "https://via.placeholder.com/300/FFFFFF/000000?text=White+Tulip", tags: [] },
    { id: 14, name: "Букет 'Розовые Тюльпаны'", category: "tulips", price: 4990, image: "https://via.placeholder.com/300/FFC0CB/000000?text=Pink+Tulip", tags: [] },
    { id: 15, name: "Букет 'Оранжевые Тюльпаны'", category: "tulips", price: 5490, image: "https://via.placeholder.com/300/FFA500/000000?text=Orange+Tulip", tags: [] },
    { id: 16, name: "Букет 'Фиолетовые Тюльпаны'", category: "tulips", price: 5990, image: "https://via.placeholder.com/300/800080/FFFFFF?text=Purple+Tulip", tags: [] },
    { id: 17, name: "Букет 'Черные Тюльпаны'", category: "tulips", price: 6490, image: "https://via.placeholder.com/300/000000/FFFFFF?text=Black+Tulip", tags: [] },
    { id: 18, name: "Букет 'Радужные Тюльпаны'", category: "tulips", price: 7490, image: "https://via.placeholder.com/300/FF00FF/000000?text=Rainbow+Tulip", tags: [] },
    { id: 19, name: "Букет 'Кремовые Тюльпаны'", category: "tulips", price: 5490, image: "https://via.placeholder.com/300/F5F5DC/000000?text=Cream+Tulip", tags: [] },
    { id: 20, name: "Букет 'Зеленые Тюльпаны'", category: "tulips", price: 5290, image: "https://via.placeholder.com/300/008000/FFFFFF?text=Green+Tulip", tags: [] },

    // Пионы
    { id: 21, name: "Букет 'Розовые Пионы'", category: "peonies", price: 4990, image: "https://via.placeholder.com/300/FFC0CB/000000?text=Pink+Peony", tags: [] },
    { id: 22, name: "Букет 'Красные Пионы'", category: "peonies", price: 6990, image: "https://via.placeholder.com/300/FF0000/FFFFFF?text=Red+Peony", tags: [] },
    { id: 23, name: "Букет 'Белые Пионы'", category: "peonies", price: 7490, image: "https://via.placeholder.com/300/FFFFFF/000000?text=White+Peony", tags: [] },
    { id: 24, name: "Букет 'Желтые Пионы'", category: "peonies", price: 7490, image: "https://via.placeholder.com/300/FFFF00/000000?text=Yellow+Peony", tags: [] },
    { id: 25, name: "Букет 'Оранжевые Пионы'", category: "peonies", price: 7990, image: "https://via.placeholder.com/300/FFA500/000000?text=Orange+Peony", tags: [] },
    { id: 26, name: "Букет 'Фиолетовые Пионы'", category: "peonies", price: 8490, image: "https://via.placeholder.com/300/800080/FFFFFF?text=Purple+Peony", tags: [] },
    { id: 27, name: "Букет 'Черные Пионы'", category: "peonies", price: 9490, image: "https://via.placeholder.com/300/000000/FFFFFF?text=Black+Peony", tags: [] },
    { id: 28, name: "Букет 'Радужные Пионы'", category: "peonies", price: 9990, image: "https://via.placeholder.com/300/FF00FF/000000?text=Rainbow+Peony", tags: [] },
    { id: 29, name: "Букет 'Кремовые Пионы'", category: "peonies", price: 7490, image: "https://via.placeholder.com/300/F5F5DC/000000?text=Cream+Peony", tags: [] },
    { id: 30, name: "Букет 'Коралловые Пионы'", category: "peonies", price: 8290, image: "https://via.placeholder.com/300/FF7F50/000000?text=Coral+Peony", tags: [] },

    // Лилии
    { id: 31, name: "Букет 'Белые Лилии'", category: "lilies", price: 4990, image: "https://via.placeholder.com/300/FFFFFF/000000?text=White+Lily", tags: [] },
    { id: 32, name: "Букет 'Красные Лилии'", category: "lilies", price: 7990, image: "https://via.placeholder.com/300/FF0000/FFFFFF?text=Red+Lily", tags: [] },
    { id: 33, name: "Букет 'Розовые Лилии'", category: "lilies", price: 7990, image: "https://via.placeholder.com/300/FFC0CB/000000?text=Pink+Lily", tags: [] },
    { id: 34, name: "Букет 'Желтые Лилии'", category: "lilies", price: 8490, image: "https://via.placeholder.com/300/FFFF00/000000?text=Yellow+Lily", tags: [] },
    { id: 35, name: "Букет 'Оранжевые Лилии'", category: "lilies", price: 8990, image: "https://via.placeholder.com/300/FFA500/000000?text=Orange+Lily", tags: [] },
    { id: 36, name: "Букет 'Фиолетовые Лилии'", category: "lilies", price: 9490, image: "https://via.placeholder.com/300/800080/FFFFFF?text=Purple+Lily", tags: [] },
    { id: 37, name: "Букет 'Черные Лилии'", category: "lilies", price: 9990, image: "https://via.placeholder.com/300/000000/FFFFFF?text=Black+Lily", tags: [] },
    { id: 38, name: "Букет 'Радужные Лилии'", category: "lilies", price: 10490, image: "https://via.placeholder.com/300/FF00FF/000000?text=Rainbow+Lily", tags: [] },
    { id: 39, name: "Букет 'Кремовые Лилии'", category: "lilies", price: 8490, image: "https://via.placeholder.com/300/F5F5DC/000000?text=Cream+Lily", tags: [] },
    { id: 40, name: "Букет 'Тигровые Лилии'", category: "lilies", price: 9290, image: "https://via.placeholder.com/300/FF8C00/000000?text=Tiger+Lily", tags: [] },

    // Орхидеи
    { id: 41, name: "Орхидея 'Белая Фея'", category: "orchids", price: 4990, image: "https://via.placeholder.com/300/FFFFFF/000000?text=White+Orchid", tags: [] },
    { id: 42, name: "Орхидея 'Красная Королева'", category: "orchids", price: 7490, image: "https://via.placeholder.com/300/FF0000/FFFFFF?text=Red+Orchid", tags: [] },
    { id: 43, name: "Орхидея 'Розовая Принцесса'", category: "orchids", price: 6990, image: "https://via.placeholder.com/300/FFC0CB/000000?text=Pink+Orchid", tags: [] },
    { id: 44, name: "Орхидея 'Желтое Солнце'", category: "orchids", price: 7490, image: "https://via.placeholder.com/300/FFFF00/000000?text=Yellow+Orchid", tags: [] },
    { id: 45, name: "Орхидея 'Оранжевый Закат'", category: "orchids", price: 7990, image: "https://via.placeholder.com/300/FFA500/000000?text=Orange+Orchid", tags: [] },
    { id: 46, name: "Орхидея 'Фиолетовая Ночь'", category: "orchids", price: 8490, image: "https://via.placeholder.com/300/800080/FFFFFF?text=Purple+Orchid", tags: [] },
    { id: 47, name: "Орхидея 'Черная Жемчужина'", category: "orchids", price: 8990, image: "https://via.placeholder.com/300/000000/FFFFFF?text=Black+Orchid", tags: [] },
    { id: 48, name: "Орхидея 'Радужный Сон'", category: "orchids", price: 9490, image: "https://via.placeholder.com/300/FF00FF/000000?text=Rainbow+Orchid", tags: [] },
    { id: 49, name: "Орхидея 'Кремовая Мечта'", category: "orchids", price: 7490, image: "https://via.placeholder.com/300/F5F5DC/000000?text=Cream+Orchid", tags: [] },
    { id: 50, name: "Орхидея 'Голубая Лагуна'", category: "orchids", price: 7990, image: "https://via.placeholder.com/300/ADD8E6/000000?text=Blue+Orchid", tags: [] },

    // Букеты
    { id: 51, name: "Букет 'Летний Микс'", category: "bouquets", price: 3990, image: "https://via.placeholder.com/300/FFD700/000000?text=Summer+Mix", tags: [{type: "sale", text: "Акция"}] },
    { id: 52, name: "Букет 'Весенний Бал'", category: "bouquets", price: 4490, image: "https://via.placeholder.com/300/90EE90/000000?text=Spring+Ball", tags: [] },
    { id: 53, name: "Букет 'Осенняя Сказка'", category: "bouquets", price: 6490, image: "https://via.placeholder.com/300/DAA520/000000?text=Autumn+Tale", tags: [] },
    { id: 54, name: "Букет 'Зимняя Свежесть'", category: "bouquets", price: 5990, image: "https://via.placeholder.com/300/ADD8E6/000000?text=Winter+Freshness", tags: [] },
    { id: 55, name: "Букет 'Морской Бриз'", category: "bouquets", price: 6990, image: "https://via.placeholder.com/300/ADD8E6/000000?text=Sea+Breeze", tags: [] },
    { id: 56, name: "Букет 'Горный Воздух'", category: "bouquets", price: 7490, image: "https://via.placeholder.com/300/87CEEB/000000?text=Mountain+Air", tags: [] },
    { id: 57, name: "Букет 'Лесная Сказка'", category: "bouquets", price: 6990, image: "https://via.placeholder.com/300/228B22/FFFFFF?text=Forest+Tale", tags: [] },
    { id: 58, name: "Букет 'Полевые Цветы'", category: "bouquets", price: 5490, image: "https://via.placeholder.com/300/DAA520/000000?text=Field+Flowers", tags: [] },
    { id: 59, name: "Букет 'Садовые Розы'", category: "bouquets", price: 7990, image: "https://via.placeholder.com/300/FFB6C1/000000?text=Garden+Roses", tags: [] },
    { id: 60, name: "Букет 'Пионовый Рай'", category: "bouquets", price: 8490, image: "https://via.placeholder.com/300/FFC0CB/000000?text=Peony+Paradise", tags: [] }
];

// Функция для рендеринга товаров
function renderProducts(category = 'all', minPrice = 0, maxPrice = 20000, page = 1) {
    const productsGrid = document.querySelector('.products-grid');
    if (!productsGrid) return;

    // Фильтруем товары
    let filteredProducts = productsData.filter(product => {
        const matchesCategory = (category === 'all' || product.category === category);
        const matchesPrice = (product.price >= minPrice && product.price <= maxPrice);
        return matchesCategory && matchesPrice;
    });

    // Пагинация
    const itemsPerPage = 10; // Например, 10 товаров на страницу
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    // Рендерим товары
    productsGrid.innerHTML = paginatedProducts.map(productCardTemplate).join('');

    // Обновляем пагинацию
    const paginationContainer = document.querySelector('.pagination');
    if (paginationContainer) {
        paginationContainer.innerHTML = ''; // Очищаем старую пагинацию

        // Кнопка "Предыдущая"
        if (page > 1) {
            const prevLink = document.createElement('a');
            prevLink.href = `#catalog`;
            prevLink.textContent = 'Предыдущая';
            prevLink.classList.add('prev');
            prevLink.addEventListener('click', (e) => {
                e.preventDefault();
                const currentCategory = document.querySelector('.filter-group a.active')?.dataset.category || 'all';
                const currentMinPrice = parseInt(document.querySelector('.price-inputs input[placeholder="От"]').value) || 0;
                const currentMaxPrice = parseInt(document.querySelector('.price-inputs input[placeholder="До"]').value) || 20000;
                renderProducts(currentCategory, currentMinPrice, currentMaxPrice, page - 1);
            });
            paginationContainer.appendChild(prevLink);
        }

        // Номера страниц
        for (let i = 1; i <= totalPages; i++) {
            const pageLink = document.createElement('a');
            pageLink.href = `#catalog`;
            pageLink.textContent = i;
            if (i === page) {
                pageLink.classList.add('active');
            }
            pageLink.addEventListener('click', (e) => {
                e.preventDefault();
                const currentCategory = document.querySelector('.filter-group a.active')?.dataset.category || 'all';
                const currentMinPrice = parseInt(document.querySelector('.price-inputs input[placeholder="От"]').value) || 0;
                const currentMaxPrice = parseInt(document.querySelector('.price-inputs input[placeholder="До"]').value) || 20000;
                renderProducts(currentCategory, currentMinPrice, currentMaxPrice, i);
            });
            paginationContainer.appendChild(pageLink);
        }

        // Кнопка "Следующая"
        if (page < totalPages) {
            const nextLink = document.createElement('a');
            nextLink.href = `#catalog`;
            nextLink.textContent = 'Следующая';
            nextLink.classList.add('next');
            nextLink.addEventListener('click', (e) => {
                e.preventDefault();
                const currentCategory = document.querySelector('.filter-group a.active')?.dataset.category || 'all';
                const currentMinPrice = parseInt(document.querySelector('.price-inputs input[placeholder="От"]').value) || 0;
                const currentMaxPrice = parseInt(document.querySelector('.price-inputs input[placeholder="До"]').value) || 20000;
                renderProducts(currentCategory, currentMinPrice, currentMaxPrice, page + 1);
            });
            paginationContainer.appendChild(nextLink);
        }
    }
}

// Обновляем функционал аккаунта
function bindAccountEvents() {
    // Обработчик переключения разделов в личном кабинете
    document.querySelectorAll('.account-menu a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = e.target.dataset.section;
            
            // Убираем активный класс у всех ссылок
            document.querySelectorAll('.account-menu a').forEach(l => l.classList.remove('active'));
            // Добавляем активный класс текущей ссылке
            e.target.classList.add('active');
            
            // Скрываем все секции
            document.querySelectorAll('.account-section').forEach(s => s.style.display = 'none');
            // Показываем выбранную секцию
            document.querySelector(`.${section}-section`).style.display = 'block';
        });
    });

    // Обработчик формы профиля
    const profileForm = document.querySelector('.profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('profile-name').value;
            const email = document.getElementById('profile-email').value;
            const phone = document.getElementById('profile-phone').value;

            userProfile.data = { name, email, phone };
            userProfile.saveProfileData();
            cart.showNotification('Личные данные сохранены');
        });
    }

    // Обработчик формы адресов
    const addressForm = document.querySelector('.address-form');
    if (addressForm) {
        addressForm.addEventListener('submit', (e) => {
            e.preventDefault();
            userProfile.addAddress();
        });
    }
}