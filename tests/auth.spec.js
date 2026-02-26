const { test, expect } = require('@playwright/test');
const { ADMIN, USER } = require('../test-data/credentials'); 

const { generateTestUser } = require('../test-data/userData');

const { LoginPage } = require('../pages/LoginPage');
const { Header } = require('../pages/Header');
const { RegisterPage } = require('../pages/RegisterPage');

test.describe('Auth & Registration Module', () => {

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

  test('TC#4: User should be able to Logout successfully @TC4', async ({ page }) => {
    const header = new Header(page);

    await loginPage.login(USER.email, USER.password);
    await loginPage.verifySuccessfulLogin();
    await loginPage.verifyNotificationText('Вход выполнен успешно!');

    await header.logout();

    await loginPage.verifyAccessDenied('/orders');
  });

  test('TC#5: User Registration: Successful flow @TC5', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.navigate();

    const newUser = generateTestUser();
    await registerPage.register(newUser);

    await registerPage.verifyNotificationText('Регистрация прошла успешно! Теперь вы можете войти.');
    await registerPage.verifySuccessfulRegistration();
  });

  test('TC#6: Registration: Field Validation (Phone & Password) @TC6', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.navigate();

    const invalidUser = generateTestUser({
      phone: '123',
      password: '123'
    });
    await registerPage.register(invalidUser);

    // проверка пароля
    await registerPage.verifyPasswordValidationError();

    // исправляем пароль
    await registerPage.fixPasswordAndSubmit('ValidPassword123!');

    // проверка телефона и что находимся на странице /register
    await registerPage.verifyNotificationText('phoneNumber must be in international format (starting with +)');
    await registerPage.verifyRemainsOnPage();
  });

  test('TC#7: Registration: Duplicate Email Validation @TC7', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.navigate();

    const duplicateUser = generateTestUser({
      email: ADMIN.email
    });
    await registerPage.register(duplicateUser);

    await registerPage.verifyRemainsOnPage(`Email "${ADMIN.email}" already exists.`);
    await registerPage.verifyRemainsOnPage();
  });

  test('TC#8: User should not be able to login with invalid password @TC8', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    
    await loginPage.login(USER.email, 'wrongpassword');

    await loginPage.verifyErrorMessageText('Неверный email или пароль'); 
    await loginPage.verifyRemainsOnPage();
  });

  test('TC#9: User should see validation errors for empty fields @TC9', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();

    await loginPage.clickLoginButton();

    await loginPage.verifyEmptyFieldsErrors();
  });

});