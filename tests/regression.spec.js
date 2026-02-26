// Наборы регрессионных E2E тестов для Shop System
const { test, expect } = require('@playwright/test');

const { LoginPage } = require('../pages/LoginPage');
const { CatalogPage } = require('../pages/CatalogPage');
const { RegisterPage } = require('../pages/RegisterPage');
const { Header } = require('../pages/Header');
const { CartPage } = require('../pages/CartPage');
const { AdminPage } = require('../pages/AdminPage');

test.describe('Regression Tests - Регрессионное тестирование', () => {

  test('Shopping Cart & Navigation Regression: Навигация и пустая корзина @regression', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const catalogPage = new CatalogPage(page);
    const header = new Header(page); 
    const cartPage = new CartPage(page);
    const registerPage = new RegisterPage(page);

    // 1. Генерируем нового пользователя, чтобы гарантировать пустую корзину
    const uniqueId = Date.now();
    const uniqueEmail = `emptycart_${uniqueId}@test.com`;

    await registerPage.navigate();
    await registerPage.register({
      firstName: 'Тест',
      lastName: 'Корзины',
      email: uniqueEmail,
      username: `empty_${uniqueId}`,
      phone: '+79991112233',
      password: 'password123'
    });
    
    // Ждем редиректа и логинимся под свежим пользователем
    await expect(page).toHaveURL('/login');
    await loginPage.login(uniqueEmail, 'password123');
    await expect(page).toHaveURL('/');

    // 2. Main Page & Catalog TC#2: Проверка возврата на главную страницу кликом по логотипу
    await header.openCart();
    await header.navigateHome();
    await expect(page).toHaveURL('/');

    // 3. Shopping Cart TC#8: Проверка пустого состояния корзины
    await header.openCart();
    // Проверяем, что появилось сообщение о пустой корзине
    await expect(cartPage.emptyMessage).toBeVisible(); 

    // Стоимость корзины равна 0
    await expect(cartPage.totalPrice).toContainText('0');

    // 4. Shopping Cart TC#9: Кнопка оформления заказа должна быть отключена
    await expect(cartPage.checkoutButton).toBeDisabled(); 
  });

  test('Admin Regression: Успешное удаление товара (Admin Panel TC#6) @regression', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const adminPage = new AdminPage(page);

    // Вход под админом
    await loginPage.navigate();
    await loginPage.login('admin@test.com', 'admin123');
    await expect(page).toHaveURL('/');

    // Переход в админку -> Товары
    await adminPage.navigate();
    await adminPage.openProductsTab();

    // 1. Создаем временный товар специально для удаления
    const tempProductName = `DeleteMe_${Date.now()}`;
    await adminPage.createProduct({
      name: tempProductName,
      price: 150,
      description: 'Товар на удаление',
      category: 'Электроника',
      urlImage: 'https://placehold.co/100'
    });

    // Убеждаемся, что товар создался
    await expect(adminPage.toastMessage.first()).toContainText('Товар успешно создан');

    // 2. Admin Panel TC#6: Удаляем этот созданный товар
    await adminPage.deleteProduct(tempProductName);

    // 3. Проверяем, что система выдала успешное сообщение об удалении
    await expect(adminPage.toastMessage.first()).toContainText('Товар удален');
  });

  test('API Regression: Доступность Swagger документации @regression', async ({ page }) => {
    // 1. API TC#1: Проверка загрузки страницы Swagger (порт 3000 - бэкенд)
    await page.goto('http://localhost:3000/api-docs');
    
    // Проверяем, что заголовок Swagger загрузился
    const swaggerHeader = page.locator('h1', { hasText: 'Shop System API' });
    await expect(swaggerHeader).toBeVisible();
  });

});