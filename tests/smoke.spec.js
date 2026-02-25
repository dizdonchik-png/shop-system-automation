// Наборы smoke E2E tests для Shop System
const { test, expect } = require('@playwright/test');

const { LoginPage } = require('../pages/LoginPage');
const { Header } = require('../pages/Header');
const { CatalogPage } = require('../pages/CatalogPage');
const { CartPage } = require('../pages/CartPage');
const { AdminPage } = require('../pages/AdminPage');

test.describe('Smoke Tests - Критический путь магазина', () => {

  test('User E2E: Авторизация, добавление в корзину и оформление заказа @smoke', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const header = new Header(page);
    const catalogPage = new CatalogPage(page);
    const cartPage = new CartPage(page);

    // 1. Auth & Registration TC#2: Успешный логин пользователя
    await loginPage.navigate();

    await loginPage.login('user1@test.com', 'user123'); 
    await expect(page).toHaveURL('/');

    // 2. Main Page & Catalog TC#1: Проверка загрузки каталога товаров
    await catalogPage.verifyCatalogLoaded();

    // 3. Shopping Cart TC#1: Добавление товара в корзину
    await catalogPage.addProductToCart('iPhone 15 Pro'); 

    // 4. Shopping Cart TC#2 & TC#3: Переход в корзину и проверка контента
    await header.openCart();
    await expect(cartPage.title).toBeVisible();
    await expect(cartPage.checkoutButton).toBeEnabled();

    // 5. Orders & Profile TC#1: Успешное оформление заказа
    await cartPage.clickCheckout();
    
    // Ожидаемый результат: "Заказ успешно создан"
    const notification = await catalogPage.getNotificationText();
    expect(notification).toContain('Заказ успешно создан!');
  });


  test('Admin E2E: Авторизация и создание нового товара @smoke', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const adminPage = new AdminPage(page);

    // 1. Auth & Registration TC#1: Успешный логин Администратора
    await loginPage.navigate();
    await loginPage.login('admin@test.com', 'admin123');
    await expect(page).toHaveURL('/');

    // Переход в админ-панель и открытие вкладки "Товары"
    await adminPage.navigate();
    await adminPage.openProductsTab();

    // 2. Admin Panel TC#4: Создание нового товара
    const newProduct = {
      name: `Smoke Test Product ${Date.now()}`,
      price: 999.99,
      description: 'Товар создан автотестом для проверки критического пути',
      category: 'Электроника',
      urlImage: 'https://placehold.co/600x400/png' 
    };

    await adminPage.createProduct(newProduct);

    // 3. Проверка успешного создания
    const notification = await adminPage.getNotificationText();
    expect(notification).toContain('Товар успешно создан');
  });

});