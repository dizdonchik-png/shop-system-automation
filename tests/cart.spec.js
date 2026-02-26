const { test, expect } = require('@playwright/test');

const { CatalogPage } = require('../pages/CatalogPage');
const { Header } = require('../pages/Header');
const { CartPage } = require('../pages/CartPage');
const { LoginPage } = require('../pages/LoginPage');
const { RegisterPage } = require('../pages/RegisterPage');

test.describe('Shopping Cart Module', () => {

  // Предусловие: пользователь авторизован
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login('user1@test.com', 'user123');
    await expect(page).toHaveURL('/');
  });

  test('TC#1: User should be able to add product to cart @TC1', async ({ page }) => {
    const catalogPage = new CatalogPage(page);
    
    await catalogPage.addProductToCart('iPhone 15 Pro');
    
    await expect(catalogPage.toastMessage).toContainText('Товар добавлен в корзину');
  });

  test('TC#2: User should be able to open Cart Page @TC2', async ({ page }) => {
    const header = new Header(page);
    await header.openCart();
    await expect(page).toHaveURL('/cart');
  });

  test('TC#3: User should see correct content in Shopping Cart @TC3', async ({ page }) => {
    const catalogPage = new CatalogPage(page);
    const header = new Header(page);
    const cartPage = new CartPage(page);

    await catalogPage.addProductToCart('Logitech MX Master 3S');
    await header.openCart();

    await expect(cartPage.title).toBeVisible();
    await expect(page.getByRole('button', { name: 'Удалить' }).first()).toBeVisible();
    await expect(cartPage.totalPrice).toBeVisible();
    await expect(cartPage.checkoutButton).toBeEnabled();
  });

  test('TC#4: Cart should display correct details for added product @TC4', async ({ page }) => {
    const catalogPage = new CatalogPage(page);
    const header = new Header(page);
    const cartPage = new CartPage(page);

    const productName = 'DJI Mini 3 Pro';
    await catalogPage.addProductToCart(productName);
    await header.openCart();

    const itemRow = cartPage.cartItemRow.filter({ hasText: productName });
    await expect(itemRow).toBeVisible();
    await expect(cartPage.totalPrice).not.toBeEmpty();
  });

  test('TC#5: User should be able to remove item from cart @TC5', async ({ page }) => {
    const catalogPage = new CatalogPage(page);
    const header = new Header(page);
    const cartPage = new CartPage(page);

    await catalogPage.addProductToCart('Uniqlo Oxford');
    await header.openCart();
    
    await cartPage.removeItem('Uniqlo Oxford');
    
    await expect(cartPage.toastMessage).toContainText('Товар удален из корзины');
  });

  test('TC#6: Total Price should update immediately after item removal @TC6', async ({ page }) => {
    const catalogPage = new CatalogPage(page);
    const header = new Header(page);
    const cartPage = new CartPage(page);

    await catalogPage.addProductToCart('iPhone 15 Pro');
    await catalogPage.addProductToCart('Sony WH-1000XM5');
    await header.openCart();

    const initialPriceText = await cartPage.getTotalPrice();
    const initialPrice = parseInt(initialPriceText.replace(/\D/g, '')); 

    await cartPage.removeItem('Sony WH-1000XM5');
    
    await page.waitForTimeout(500); 

    const newPriceText = await cartPage.getTotalPrice();
    const newPrice = parseInt(newPriceText.replace(/\D/g, ''));

    expect(newPrice).toBeLessThan(initialPrice);
  });

  test('TC#7: Cart items should persist after page reload and re-login @TC7', async ({ page }) => {
    const catalogPage = new CatalogPage(page);
    const header = new Header(page);
    const loginPage = new LoginPage(page);

    const testProduct = 'Nintendo Switch OLED';
    await catalogPage.addProductToCart(testProduct);
    await header.openCart();

    await page.reload();
    await expect(page.locator('div.flex.items-center.justify-between.p-4.border-b', { hasText: testProduct })).toBeVisible();

    await header.logout();
    await loginPage.login('user1@test.com', 'user123');
    await header.openCart();
    await expect(page.locator('div.flex.items-center.justify-between.p-4.border-b', { hasText: testProduct })).toBeVisible();
  });

});

// блок для новых пользователей с пустой корзиной
test.describe('Shopping Cart Module - Empty State', () => {
  
  test('TC#8 & TC#9: New User should see empty state and disabled checkout button @TC8_9', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const loginPage = new LoginPage(page);
    const header = new Header(page);
    const cartPage = new CartPage(page);

    const uniqueId = Date.now();
    await registerPage.navigate();
    await registerPage.register({
      firstName: 'Test',
      lastName: 'User',
      email: `cartuser_${uniqueId}@test.com`,
      username: `cart_${uniqueId}`,
      phone: '+79991230000',
      password: 'password123'
    });
    
    await expect(page).toHaveURL('/login');
    await loginPage.login(`cartuser_${uniqueId}@test.com`, 'password123');
    await expect(page).toHaveURL('/');

    await header.openCart();

    // TC#8: Проверка пустого состояния
    await expect(cartPage.emptyMessage).toBeVisible();
    await expect(cartPage.totalPrice).toContainText('0');

    // TC#9: Кнопка оформления отключена
    await expect(cartPage.checkoutButton).toBeDisabled();
  });

});