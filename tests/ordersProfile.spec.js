const { test, expect } = require('@playwright/test');

const { LoginPage } = require('../pages/LoginPage');
const { Header } = require('../pages/Header');
const { CatalogPage } = require('../pages/CatalogPage');
const { CartPage } = require('../pages/CartPage');
const { ProfilePage } = require('../pages/ProfilePage');

test.describe('Orders & Profile Module', () => {

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login('user1@test.com', 'user123');
    await expect(page).toHaveURL('/');
  });

  test('TC#1: User should be able to place an order @TC1', async ({ page }) => {
    const catalogPage = new CatalogPage(page);
    const header = new Header(page);
    const cartPage = new CartPage(page);

    await catalogPage.addProductToCart('iPhone 15 Pro');
    await header.openCart();

    await cartPage.clickCheckout();

    await expect(cartPage.toastMessage).toContainText('Заказ успешно создан');

    await expect(page).toHaveURL('/');
  });

  test('TC#2 & TC#3: Order History and Details (Accordion) @TC2_3', async ({ page }) => {
    const catalogPage = new CatalogPage(page);
    const header = new Header(page);
    const cartPage = new CartPage(page);

    // ПРЕДУСЛОВИЕ: Оформляем заказ
    const testProduct = 'Nintendo Switch OLED';
    await catalogPage.addProductToCart(testProduct);
    await header.openCart();
    await cartPage.clickCheckout();
    await expect(cartPage.toastMessage).toContainText('Заказ успешно создан');

    // Переходим на страницу заказов
    await header.openOrders();
    await expect(page).toHaveURL('/orders');

    // Проверяем заголовок страницы (TC#2)
    await expect(page.getByRole('heading', { name: 'Мои заказы' })).toBeVisible();

    // Находим первый (самый свежий) заказ в списке
    const lastOrder = page.locator('div.rounded-xl').last(); 
    await expect(lastOrder).toContainText(/Заказ #\d+/);
    await expect(lastOrder).toContainText('PENDING');

    // Проверяем раскрытие деталей аккордеона (TC#3)
    await lastOrder.locator('button').first().click(); 
    
    // Проверяем, что внутри появились детали заказа
    await expect(lastOrder).toContainText(testProduct);

    const quantityText = page.locator('p.text-sm.text-muted-foreground').filter({ hasText: /1 x/ }).last();
    await expect(quantityText).toBeVisible();

    const priceText = page.locator('div.font-medium').filter({ hasText: /руб\./ }).last();
    await expect(priceText).toBeVisible();
  });

  test('TC#4: User should be able to update Profile info @TC4', async ({ page }) => {
    const header = new Header(page);
    const profilePage = new ProfilePage(page);

    await header.openProfile();
    await expect(page).toHaveURL('/profile');

    const newName = 'Tester' + Date.now().toString().slice(-4);
    
    await profilePage.updateProfileInfo({
      username: newName,
      phone: '+79991234567'
    });

    const notification = await profilePage.getNotificationText();
    expect(notification).toContain('Профиль успешно обновлен!');

    await expect(header.userMenuButton).toContainText(newName);
  });

});