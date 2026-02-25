// Наборы sanity E2E tests для Shop System
const { test, expect } = require('@playwright/test');

const { LoginPage } = require('../pages/LoginPage');
const { RegisterPage } = require('../pages/RegisterPage');
const { ProfilePage } = require('../pages/ProfilePage');
const { Header } = require('../pages/Header');
const { CatalogPage } = require('../pages/CatalogPage');
const { CartPage } = require('../pages/CartPage');
const { AdminPage } = require('../pages/AdminPage');

test.describe('Sanity Tests - Проверка основного функционала', () => {

  test('User Sanity: Регистрация и обновление профиля @sanity', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const loginPage = new LoginPage(page);
    const header = new Header(page);
    const profilePage = new ProfilePage(page);

    // Auth & Registration TC#5: Успешная регистрация
    await registerPage.navigate();
    
    const uniqueUser = `user_${Date.now()}`; 
    await registerPage.register({
      firstName: 'Тест',
      lastName: 'Тестеров',
      email: `${uniqueUser}@test.com`,
      username: uniqueUser,
      phone: '+79991234567',
      password: 'password123'
    });

    await expect(page).toHaveURL('/login');

    await loginPage.login(`${uniqueUser}@test.com`, 'password123');
    await expect(page).toHaveURL('/');

    // Orders & Profile TC#4: Переход в профиль и обновление данных
    await header.openProfile();
    await profilePage.updateProfileInfo({
      username: 'NewUsername'
    });

    await expect(profilePage.notificationMessage).toContainText('Профиль успешно обновлен');

    await expect(header.userMenuButton.locator('span')).toContainText('NewUsername');
  });

  test('Cart Sanity: Удаление товара и пересчет суммы @sanity', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const catalogPage = new CatalogPage(page);
    const header = new Header(page);
    const cartPage = new CartPage(page);

    await loginPage.navigate();
    await loginPage.login('user1@test.com', 'user123');
    await expect(page).toHaveURL('/');

    // Shopping Cart TC#4: Добавление двух разных товаров
    await catalogPage.addProductToCart('iPhone 15 Pro');
    await catalogPage.addProductToCart('Surface Pro 9');

    await header.openCart();

    const initialPriceText = await cartPage.getTotalPrice();
    const initialPrice = parseFloat(initialPriceText.replace(/[^\d.-]/g, ''));

    // Shopping Cart TC#5: Удаление одного товара
    await cartPage.removeItem('iPhone 15 Pro'); 

    // Shopping Cart TC#6: Проверка, что сумма пересчиталась и стала меньше
    const newPriceText = await cartPage.getTotalPrice();
    const newPrice = parseFloat(newPriceText.replace(/[^\d.-]/g, ''));
    
    expect(newPrice).toBeLessThan(initialPrice);
  });

  test('Admin Sanity: Редактирование товара @sanity', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const adminPage = new AdminPage(page);

    await loginPage.navigate();
    await loginPage.login('admin@test.com', 'admin123');
    await expect(page).toHaveURL('/');

    await adminPage.navigate();
    await adminPage.openProductsTab();

    // Admin Panel TC#5: Редактирование товара
    const newPrice = 9999;
    
    await adminPage.editProductPrice('DJI Mini 3 Pro', newPrice);

    const notification = await adminPage.getNotificationText();
    expect(notification).toContain('Товар успешно обновлен');
  });

});