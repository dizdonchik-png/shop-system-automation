const { expect } = require('@playwright/test');

class RegisterPage {
  constructor(page) {
    this.page = page;

    this.firstNameInput = page.locator('input[name="firstname"]');
    this.lastNameInput = page.locator('input[name="lastname"]');
    this.emailInput = page.locator('input[name="email"]');
    this.usernameInput = page.locator('input[name="username"]');
    this.phoneNumberInput = page.locator('input[name="phoneNumber"]');
    this.passwordInput = page.locator('input[name="password"]');

    this.registerButton = page.getByRole('button', { name: 'Зарегистрироваться'});
    
    this.loginLink = page.getByRole('link', { name: 'Войти'});

    this.notificationMessage = page.locator('[data-sonner-toast] [data-title]');
  }

  // Переход на страницу регистрации
  async navigate() {
    await this.page.goto('/register');
  }

  // Метод регистрации нового пользователя
  async register(userData) {
    await this.firstNameInput.fill(userData.firstName);
    await this.lastNameInput.fill(userData.lastName);
    await this.emailInput.fill(userData.email);
    await this.usernameInput.fill(userData.username);
    await this.phoneNumberInput.fill(userData.phone);
    await this.passwordInput.fill(userData.password);
    await this.registerButton.click();
  }

  // Переход на страницу Логина
  async navigateToLogin() {
    await this.loginLink.click();
    await expect(this.page).toHaveURL('/login');
  }
}

module.exports = { RegisterPage };