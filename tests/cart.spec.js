const { test, expect } = require('@playwright/test');

const { USER } = require('../test-data/credentials'); 
const { generateTestUser } = require('../test-data/userData');

const { CatalogPage } = require('../pages/CatalogPage');
const { Header } = require('../pages/Header');
const { CartPage } = require('../pages/CartPage');
const { LoginPage } = require('../pages/LoginPage');
const { RegisterPage } = require('../pages/RegisterPage');

test.describe('Shopping Cart Module', () => {

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(USER.email, USER.password);
    await loginPage.verifySuccessfulLogin();
  });

  test('TC#1: User should be able to add product to cart @TC1', async ({ page }) => {
    const catalogPage = new CatalogPage(page);
    await catalogPage.addProductToCart('iPhone 15 Pro');
    await catalogPage.verifyNotificationText('Товар добавлен в корзину');
  });

  test('TC#2: User should be able to open Cart Page @TC2', async ({ page }) => {
    const header = new Header(page);
    await header.openCart();
  });

  test('TC#3: User should see correct content in Shopping Cart @TC3', async ({ page }) => {
    const catalogPage = new CatalogPage(page);
    const header = new Header(page);
    const cartPage = new CartPage(page);

    await catalogPage.addProductToCart('Logitech MX Master 3S');
    await header.openCart();

    await cartPage.verifyCartContentLoaded();
  });

  test('TC#4: Cart should display correct details for added product @TC4', async ({ page }) => {
    const catalogPage = new CatalogPage(page);
    const header = new Header(page);
    const cartPage = new CartPage(page);

    const productName = 'DJI Mini 3 Pro';
    await catalogPage.addProductToCart(productName);
    await header.openCart();

    await cartPage.verifyProductInCart(productName);
    await cartPage.verifyTotalPriceNotEmpty();
  });

  test('TC#5: User should be able to remove item from cart @TC5', async ({ page }) => {
    const catalogPage = new CatalogPage(page);
    const header = new Header(page);
    const cartPage = new CartPage(page);

    await catalogPage.addProductToCart('Uniqlo Oxford');
    await header.openCart();
    
    await cartPage.removeItem('Uniqlo Oxford');
    
    await cartPage.verifyNotificationText('Товар удален из корзины');
  });

  test('TC#6: Total Price should update immediately after item removal @TC6', async ({ page }) => {
    const catalogPage = new CatalogPage(page);
    const header = new Header(page);
    const cartPage = new CartPage(page);

    await catalogPage.addProductToCart('iPhone 15 Pro');
    await catalogPage.addProductToCart('Sony WH-1000XM5');
    await header.openCart();

    const initialPrice = await cartPage.getNumericTotalPrice(); 

    await cartPage.removeItem('Sony WH-1000XM5');
    
    // ждем уменьшения цены и проверяем ее
    await cartPage.verifyTotalPriceDecreased(initialPrice);
  });

  test('TC#7: Cart items should persist after page reload and re-login @TC7', async ({ page }) => {
    const catalogPage = new CatalogPage(page);
    const header = new Header(page);
    const loginPage = new LoginPage(page);
    const cartPage = new CartPage(page);

    const testProduct = 'Nintendo Switch OLED';
    await catalogPage.addProductToCart(testProduct);
    await header.openCart();

    await page.reload();
    await cartPage.verifyProductInCart(testProduct);

    await header.logout();

    await loginPage.login(USER.email, USER.password);
    await loginPage.verifySuccessfulLogin();

    await header.openCart();

    await cartPage.verifyProductInCart(testProduct); 
  });

});

// блок для новых пользователей с пустой корзиной
test.describe('Shopping Cart Module - Empty State', () => {
  
  test('TC#8 & TC#9: New User should see empty state and disabled checkout button @TC8_9', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const loginPage = new LoginPage(page);
    const header = new Header(page);
    const cartPage = new CartPage(page);

    const newUser = generateTestUser();
    await registerPage.navigate();
    await registerPage.register(newUser);

    await registerPage.verifySuccessfulRegistration();
    
    await loginPage.login(newUser.email, newUser.password);
    await loginPage.verifySuccessfulLogin();

    await header.openCart();

    // TC#8 и TC#9: Проверка пустого состояния и кнопка оформления заказа disabled
    await cartPage.verifyCartIsEmpty();
  });

});