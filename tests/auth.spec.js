const { test, expect } = require('@playwright/test');

const { LoginPage } = require('../pages/LoginPage');
const { Header } = require('../pages/Header');
const { RegisterPage } = require('../pages/RegisterPage');

test.describe('Auth & Registration Module', () => {

  test('TC#1: Admin should be able to login with valid credentials @TC1', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login('admin@test.com', 'admin123');
    
    await expect(page).toHaveURL('/');
    const notification = page.locator('[data-sonner-toast] [data-title]').first();
    await expect(notification).toContainText('Вход выполнен успешно!');
  });

  test('TC#2: User should be able to login with valid credentials @TC2', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login('user1@test.com', 'user123');
    
    await expect(page).toHaveURL('/');
    const notification = page.locator('[data-sonner-toast] [data-title]').first();
    await expect(notification).toContainText('Вход выполнен успешно!');
  });

  test('TC#3: User should be redirected to the Registration page @TC3', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.navigateToRegistration();
  });

  test('TC#4: User should be able to Logout successfully @TC4', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const header = new Header(page);

    await loginPage.navigate();
    await loginPage.login('user1@test.com', 'user123');
    await expect(page).toHaveURL('/');

    await header.logout();

    await page.goto('/orders');
    await expect(page).toHaveURL('/login');
  });

  test('TC#5: User Registration: Successful flow @TC5', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.navigate();

    const uniqueId = Date.now();
    await registerPage.register({
      firstName: 'Тест',
      lastName: 'Юзер',
      email: `newuser_${uniqueId}@test.com`,
      username: `user_${uniqueId}`,
      phone: '+79991234567',
      password: 'password123'
    });

    await expect(registerPage.notificationMessage).toContainText('Регистрация прошла успешно! Теперь вы можете войти.');

    await expect(page).toHaveURL('/login');
  });

  test('TC#6: Registration: Field Validation (Phone & Password) @TC6', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.navigate();

    await registerPage.register({
      firstName: 'Тест',
      lastName: 'Юзер',
      email: `test_${Date.now()}@test.com`,
      username: `user_${Date.now()}`,
      phone: '123', // Невалидный короткий номер
      password: '123' // Короткий пароль
    });

    // проверка пароля
    const passwordLabel = page.locator('label').filter({ hasText: 'Пароль' });
    await expect(passwordLabel).toHaveClass(/text-destructive/);
    await expect(passwordLabel).toHaveCSS('color', 'rgb(127, 29, 29)');
    await expect(registerPage.passwordInput).toBeFocused();

    // исправляем пароль
    await registerPage.passwordInput.fill('ValidPassword123!');
    await registerPage.registerButton.click();

    // проверка телефона
    await expect(registerPage.notificationMessage).toBeVisible();
    await expect(registerPage.notificationMessage).toContainText('phoneNumber must be in international format (starting with +)');

    await expect(page).toHaveURL('/register');
  });

  test('TC#7: Registration: Duplicate Email Validation @TC7', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.navigate();

    await registerPage.register({
      firstName: 'Клон',
      lastName: 'Админов',
      email: 'admin@test.com', // существующий email
      username: `clone_${Date.now()}`,
      phone: '+79990001122',
      password: 'password123'
    });

    await expect(registerPage.notificationMessage).toContainText('Email "admin@test.com" already exists.'); 
    await expect(page).toHaveURL('/register');
  });

  test('TC#8: User should not be able to login with invalid password @TC8', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    
    await loginPage.login('user1@test.com', 'wrongpassword');

    const errorMessage = await loginPage.getErrorMessageText();
    expect(errorMessage).toContain('Неверный email или пароль'); 
    await expect(page).toHaveURL('/login');
  });

  test('TC#9: User should see validation errors for empty fields @TC9', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();

    await loginPage.loginButton.click();

    await expect(page.getByText('Email обязателен')).toBeVisible();
    await expect(page.getByText('Пароль обязателен')).toBeVisible();
  });

});