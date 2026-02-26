const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');

class RegisterPage extends BasePage {
  constructor(page) {
    super(page);

    this.firstNameInput = page.locator('input[name="firstname"]');
    this.lastNameInput = page.locator('input[name="lastname"]');
    this.emailInput = page.locator('input[name="email"]');
    this.usernameInput = page.locator('input[name="username"]');
    this.phoneNumberInput = page.locator('input[name="phoneNumber"]');
    this.passwordInput = page.locator('input[name="password"]');
    // Локатор для лейбла поля "Пароль"
    this.passwordLabel = page.locator('label').filter({ hasText: 'Пароль' });

    this.registerButton = page.getByRole('button', { name: 'Зарегистрироваться'});
    
    this.loginLink = page.getByRole('link', { name: 'Войти'});

    this.notificationMessage = page.locator('[data-sonner-toast] [data-title]').first();
  }

  // Переход на страницу регистрации
  async navigate() {
    await this.open('/register');
  }

  // Метод регистрации нового пользователя
  async register(userData) {
    await this.step('Заполнение формы регистрации', async () => {
      await this.fillField(this.firstNameInput, userData.firstName, 'Имя');
      await this.fillField(this.lastNameInput, userData.lastName, 'Фамилия');
      await this.fillField(this.emailInput, userData.email, 'Email');
      await this.fillField(this.usernameInput, userData.username, 'Username');
      await this.fillField(this.phoneNumberInput, userData.phone, 'Телефон');
      await this.fillField(this.passwordInput, userData.password, 'Пароль');
      
      await this.clickElement(this.registerButton, 'Кнопка Зарегистрироваться');
    });
  }

  // Переход на страницу Логина
  async navigateToLogin() {
    await this.clickElement(this.loginLink, 'Ссылка Войти');
    await expect(this.page).toHaveURL('/login');
  }

  // Проверка текста во всплывающем уведомлении
  async verifyNotificationText(expectedText) {
    await expect(this.notificationMessage).toBeVisible();
    await expect(this.notificationMessage).toContainText(expectedText);
  }

  // Проверка успешного редиректа на страницу логина
  async verifySuccessfulRegistration() {
    await expect(this.page).toHaveURL('/login');
  }

  // Проверка ошибки пароля (красный текст и фокус)
  async verifyPasswordValidationError() {
    await expect(this.passwordLabel).toHaveClass(/text-destructive/);
    await expect(this.passwordLabel).toHaveCSS('color', 'rgb(127, 29, 29)');
    await expect(this.passwordInput).toBeFocused();
  }

  // Метод для исправления пароля и повторной отправки формы
  async fixPasswordAndSubmit(newPassword) {
    await this.passwordInput.fill(newPassword);
    await this.registerButton.click();
  }

  // Проверка, что мы все еще находимся на странице регистрации
  async verifyRemainsOnPage() {
    await expect(this.page).toHaveURL('/register');
  }
}

module.exports = { RegisterPage };