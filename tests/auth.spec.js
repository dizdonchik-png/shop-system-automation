const { test, expect } = require('@playwright/test');

const { USER, ADMIN } = require('../test-data/credentials'); 
const { generateTestUser } = require('../test-data/userData');
const { loginAs } = require('../test-data/helpers');

const { LoginPage } = require('../pages/LoginPage');
const { Header } = require('../pages/Header');
const { RegisterPage } = require('../pages/RegisterPage');

test.describe('Auth & Registration Module', () => {

  test.describe('Login flow', () => {
    let loginPage; 

    test.beforeEach(async ({ page }) => {
      loginPage = new LoginPage(page);
      await loginPage.navigate();
    });

    test('TC#1: Admin should be able to login with valid credentials @TC1', async ({ page }) => {
      await loginPage.login(ADMIN.email, ADMIN.password);
      await loginPage.verifySuccessfulLogin();
      await loginPage.verifyNotificationText('Вход выполнен успешно!');
    });

    test('TC#2: User should be able to login with valid credentials @TC2', async ({ page }) => {
      await loginPage.login(USER.email, USER.password);
      await loginPage.verifySuccessfulLogin();
      await loginPage.verifyNotificationText('Вход выполнен успешно!');
    });

    test('TC#3: User should be redirected to the Registration page @TC3', async ({ page }) => {
      await loginPage.navigateToRegistration();
    });

    test('TC#8: User should not be able to login with invalid password @TC8', async ({ page }) => {
      await loginPage.login(USER.email, 'wrongpassword');
      await loginPage.verifyNotificationText('Неверный email или пароль'); 
      await loginPage.verifyRemainsOnPage();
    });

    test('TC#9: User should see validation errors for empty fields @TC9', async ({ page }) => {
      await loginPage.clickLoginButton();
      await loginPage.verifyEmptyFieldsErrors();
      await loginPage.verifyRemainsOnPage();
    });

  })

  test.describe('Registration flow', () => {
    let registerPage;

    test.beforeEach(async ({ page }) => {
      registerPage = new RegisterPage(page);
      await registerPage.navigate();
    });

    test('TC#5: User Registration: Successful flow @TC5', async ({ page }) => {
      const newUser = generateTestUser();
      await registerPage.register(newUser);

      await registerPage.verifyNotificationText('Регистрация прошла успешно! Теперь вы можете войти.');
      await registerPage.verifySuccessfulRegistration();
    });

    test('TC#6: Registration: Field Validation (Phone & Password) @TC6', async ({ page }) => {
      const invalidUser = generateTestUser({
        phone: '89001234567',
        password: '123'
      });
      await registerPage.register(invalidUser);

      // проверка пароля на фронте
      await registerPage.verifyPasswordValidationError();

      // исправляем пароль
      await registerPage.fixPasswordAndSubmit('ValidPassword123!');

      // повторная проверка пароля
      await registerPage.verifyNotificationText('phoneNumber must be in international format');
      await registerPage.verifyRemainsOnPage();
    });

    test('TC#7: Registration: Duplicate Email Validation @TC7', async ({ page }) => {
      const duplicateUser = generateTestUser({ email: ADMIN.email });
      await registerPage.register(duplicateUser);

      await registerPage.verifyNotificationText(`Email "${ADMIN.email}" already exists.`);
      await registerPage.verifyRemainsOnPage();
    });
  })

  test.describe('Logout flow', () => {
    test('TC#4: User should be able to Logout successfully @TC4', async ({ page }) => {
      await loginAs(page, USER);
      const header = new Header(page);
      const loginPage = new LoginPage(page);

      await header.openOrders(); 
      await header.logout();

      await loginPage.verifyAccessDenied('/orders');
    });
  })

});