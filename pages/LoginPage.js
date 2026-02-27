const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');

class LoginPage extends BasePage {
  constructor(page) {
    super(page);

    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[name="password"]');

    // локаторы для ошибок в полях
    this.emailErrorMessage = page.getByText('Email обязателен');
    this.passwordErrorMessage = page.getByText('Пароль обязателен');

    this.loginButton = page.getByRole('button', { name: 'Войти'});
    
    this.registerLink = page.getByRole('link', { name: /зарегистрироваться/i });
  }

  // Перейти на страницу Логина
  async navigate() {
    await this.open('/login');
  }

  // Проверка успешной загрузки страницы после логина
  async verifySuccessfulLogin() {
    await expect(this.page).toHaveURL('/');
  }

  // Проверка, что пользователь остался на странице логина (для негативных тестов)
  async verifyRemainsOnPage() {
    await expect(this.page).toHaveURL('/login');
  }

  // Войти в систему
  async login(email, password) {
    await this.fillField(this.emailInput, email, 'Поле Email');
    await this.fillField(this.passwordInput, password, 'Поле Пароль');
    await this.clickElement(this.loginButton, 'Кнопка Войти');
  }

  // Перейти к регистрации
  async navigateToRegistration() {
    await this.clickElement(this.registerLink, 'Ссылка регистрации');
    await expect(this.page).toHaveURL('/register');
  }

  // Проверка перенаправления на логин при попытке зайти на закрытую страницу
  async verifyAccessDenied(protectedUrl) {
    await this.page.goto(protectedUrl);
    await expect(this.page).toHaveURL('/login');
  }

  // Проверка ошибок для пустых полей
  async verifyEmptyFieldsErrors() {
    await expect(this.emailErrorMessage).toBeVisible();
    await expect(this.passwordErrorMessage).toBeVisible();
  }

  // Клик по кнопке "Войти" (без заполнения полей)
  async clickLoginButton() {
    await this.clickElement(this.loginButton, 'Кнопка "Войти"');
  }
}

module.exports = { LoginPage };