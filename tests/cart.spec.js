const { test, expect } = require('@playwright/test');

const { USER } = require('../test-data/credentials'); 
const { TEST_PRODUCTS } = require('../test-data/products'); 
const { loginAs } = require('../test-data/helpers'); 
const { generateTestUser } = require('../test-data/userData');

const { CatalogPage } = require('../pages/CatalogPage');
const { Header } = require('../pages/Header');
const { CartPage } = require('../pages/CartPage');
const { LoginPage } = require('../pages/LoginPage');
const { RegisterPage } = require('../pages/RegisterPage');

test.describe('Shopping Cart Module', () => {

  test.beforeEach(async ({ page }) => {
    await loginAs(page, USER);
  });

  test('TC#1: User should be able to add product to cart @TC1', async ({ page }) => {
    const catalogPage = new CatalogPage(page);
    await catalogPage.addProductToCart(TEST_PRODUCTS.IPHONE);
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

    await catalogPage.addProductToCart(TEST_PRODUCTS.LOGITECH);
    await header.openCart();

    await cartPage.verifyCartContentLoaded();
  });

  test('TC#4: Cart should display correct details for added product @TC4', async ({ page }) => {
    const catalogPage = new CatalogPage(page);
    const header = new Header(page);
    const cartPage = new CartPage(page);

    await catalogPage.addProductToCart(TEST_PRODUCTS.DJI);
    await header.openCart();

    await cartPage.verifyProductInCart(TEST_PRODUCTS.DJI);
    await cartPage.verifyTotalPriceNotEmpty();
  });

  test('TC#5: User should be able to remove item from cart @TC5', async ({ page }) => {
    const catalogPage = new CatalogPage(page);
    const header = new Header(page);
    const cartPage = new CartPage(page);

    await catalogPage.addProductToCart(TEST_PRODUCTS.UNIQLO);
    await header.openCart();
    
    await cartPage.removeItem(TEST_PRODUCTS.UNIQLO);
    
    await cartPage.verifyNotificationText('Товар удален из корзины');
  });

  test('TC#6: Total Price should update immediately after item removal @TC6', async ({ page }) => {
    const catalogPage = new CatalogPage(page);
    const header = new Header(page);
    const cartPage = new CartPage(page);

    await catalogPage.addProductToCart(TEST_PRODUCTS.IPHONE);
    await catalogPage.verifyNotificationText('Товар добавлен в корзину');

    await catalogPage.addProductToCart(TEST_PRODUCTS.SONY);
    await catalogPage.verifyNotificationText('Товар добавлен в корзину');

    await header.openCart();

    const initialPrice = await cartPage.getNumericTotalPrice(); 

    await cartPage.removeItem(TEST_PRODUCTS.SONY);
    
    // ждем уменьшения цены и проверяем ее
    await cartPage.verifyTotalPriceDecreased(initialPrice);
  });

  test('TC#7: Cart items should persist after page reload and re-login @TC7', async ({ page }) => {
    const catalogPage = new CatalogPage(page);
    const header = new Header(page);
    const loginPage = new LoginPage(page);
    const cartPage = new CartPage(page);

    await catalogPage.addProductToCart(TEST_PRODUCTS.NINTENDO);
    await header.openCart();

    await page.reload();
    await cartPage.verifyProductInCart(TEST_PRODUCTS.NINTENDO);

    await header.logout();

    await loginPage.login(USER.email, USER.password);
    await loginPage.verifySuccessfulLogin();

    await header.openCart();

    await cartPage.verifyProductInCart(TEST_PRODUCTS.NINTENDO); 
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