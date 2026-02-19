const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');

class ProfilePage extends BasePage {
  constructor(page) {
    super(page);

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
    await this.open('/profile');
  }

  // Метод бновления данных профиля
  async updateProfileInfo(data) {
    await this.step('Обновление профиля', async () => {
      if (data.firstName) await this.fillField(this.firstNameInput, data.firstName, 'Имя');
      if (data.lastName) await this.fillField(this.lastNameInput, data.lastName, 'Фамилия');
      if (data.email) await this.fillField(this.emailInput, data.email, 'Email');
      if (data.username) await this.fillField(this.usernameInput, data.username, 'Username');
      if (data.phone) await this.fillField(this.phoneNumberInput, data.phone, 'Телефон');
      
      await this.clickElement(this.saveButton, 'Кнопка Сохранить');
    });
  }

  // Получить текст уведомления
  async getNotificationText() {
    return await this.getElementText(this.notificationMessage, 'Уведомление профиля');
  }
}

module.exports = { ProfilePage };