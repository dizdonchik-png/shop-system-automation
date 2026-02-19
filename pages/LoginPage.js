const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');

class LoginPage extends BasePage {
  constructor(page) {
    super(page);

    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[name="password"]');

    this.loginButton = page.getByRole('button', { name: 'Войти'});
    
    this.errorMessage = page.locator('[data-sonner-toast] [data-title]');
    
    this.registerLink = page.getByRole('link', { name: /зарегистрироваться/i });
  }

  // Перейти на страницу Логина
  async navigate() {
    await this.open('/login');
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

  // Метод для получения текста ошибки
  async getErrorMessageText() {
    return await this.getElementText(this.errorMessage, 'Сообщение об ошибке');
  }
}

module.exports = { LoginPage };