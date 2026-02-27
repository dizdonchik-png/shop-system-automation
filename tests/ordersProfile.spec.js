const { test, expect } = require('@playwright/test');

const { USER } = require('../test-data/credentials'); 
const { TEST_PRODUCTS } = require('../test-data/products'); 
const { loginAs } = require('../test-data/helpers'); 
const { generateTestUser } = require('../test-data/userData');

const { Header } = require('../pages/Header');
const { CatalogPage } = require('../pages/CatalogPage');
const { CartPage } = require('../pages/CartPage');
const { ProfilePage } = require('../pages/ProfilePage');
const { OrdersPage } = require('../pages/OrdersPage');

test.describe('Orders & Profile Module', () => {

  test.beforeEach(async ({ page }) => {
    await loginAs(page, USER);
  });

  test('TC#1: User should be able to place an order @TC1', async ({ page }) => {
    const catalogPage = new CatalogPage(page);
    const header = new Header(page);
    const cartPage = new CartPage(page);

    await catalogPage.addProductToCart(TEST_PRODUCTS.IPHONE);
    await catalogPage.verifyNotificationText('Товар добавлен в корзину'); 

    await header.openCart();
    await cartPage.clickCheckout();

    await cartPage.verifyNotificationText('Заказ успешно создан');
    await cartPage.verifyRedirectToHome();
  });

  test('TC#2 & TC#3: Order History and Details (Accordion) @TC2_3', async ({ page }) => {
    const catalogPage = new CatalogPage(page);
    const header = new Header(page);
    const cartPage = new CartPage(page);
    const ordersPage = new OrdersPage(page);

    // ПРЕДУСЛОВИЕ: Оформляем заказ
    await catalogPage.addProductToCart(TEST_PRODUCTS.NINTENDO);
    await catalogPage.verifyNotificationText('Товар добавлен в корзину'); 

    await header.openCart();
    await cartPage.clickCheckout();
    await cartPage.verifyNotificationText('Заказ успешно создан');

    // Переходим на страницу заказов
    await header.openOrders();

    // Проверяем заголовок страницы (TC#2)
    await ordersPage.verifyOrdersPageLoaded();
    await ordersPage.verifyLastOrderStatus('PENDING');

    // Проверяем раскрытие деталей аккордеона (TC#3)
    await ordersPage.openLastOrderDetails();
    await ordersPage.verifyOrderDetailsContains(TEST_PRODUCTS.NINTENDO);
  });

  test('TC#4: User should be able to update Profile info @TC4', async ({ page }) => {
    const header = new Header(page);
    const profilePage = new ProfilePage(page);

    const newUserData = generateTestUser();

    await header.openProfile();
    
    await profilePage.updateProfileInfo({
      username: newUserData.username,
      phone: newUserData.phone
    });

    await profilePage.verifyNotificationText('Профиль успешно обновлен!');
    await header.verifyUserName(newUserData.username);
  });

});