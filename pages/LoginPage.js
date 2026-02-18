const { expect } = require('@playwright/test');

class LoginPage {
  constructor(page) {
    this.page = page;

    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[name="password"]');

    this.loginButton = page.getByRole('button', { name: 'Войти'});
    
    this.errorMessage = page.locator('[data-sonner-toast] [data-title]');
    
    this.registerLink = page.getByRole('link', { name: /зарегистрироваться/i });
  }

  // Перейти на страницу Логина
  async navigate() {
    await this.page.goto('/login');
  }

  // Войти в систему
  async login(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  // Перейти к регистрации
  async navigateToRegistration() {
    await this.registerLink.click();
    await expect(this.page).toHaveURL('/register');
  }

  // Метод для получения текста ошибки
  async getErrorMessageText() {
    await expect(this.errorContainer).toBeVisible();
    return await this.errorMessage.textContent();
  }
}

module.exports = { LoginPage };