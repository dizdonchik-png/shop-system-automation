const { expect } = require('@playwright/test');

class ProfilePage {
  constructor(page) {
    this.page = page;

    this.firstNameInput = page.locator('input[name="firstname"]');
    this.lastNameInput = page.locator('input[name="lastname"]');
    this.emailInput = page.locator('input[name="email"]');
    this.usernameInput = page.locator('input[name="username"]');
    this.phoneInput = page.locator('input[name="phoneNumber"]');

    this.saveButton = page.getByRole('button', { name: 'Сохранить изменения'});

    this.notificationMessage = page.locator('[data-sonner-toast] [data-title]');
  }

  // Переход на страницу Профиля
  async navigate() {
    await this.page.goto('/profile');
  }

  // Метод бновления данных профиля
  async updateProfileInfo(data) {
    if (data.firstName) await this.firstNameInput.fill(data.firstName);
    if (data.lastName) await this.lastNameInput.fill(data.lastName);
    if (data.email) await this.emailInput.fill(data.email);
    if (data.username) await this.usernameInput.fill(data.username);
    if (data.phone) await this.phoneInput.fill(data.phone);
    
    await this.saveButton.click();
  }

  // Получить текст уведомления
  async getNotificationText() {
    await expect(this.notificationMessage).toBeVisible();
    return await this.notificationMessage.textContent();
  }
}

module.exports = { ProfilePage };