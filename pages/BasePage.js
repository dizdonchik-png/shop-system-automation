const { expect } = require('@playwright/test');

class BasePage {
  constructor(page) {
    this.page = page;

    // локатор для уведомлений
    this.toastMessage = page.locator('[data-sonner-toast] [data-title]').first();
  }

  async open(url) {
    await this.step(`Переход на страницу: ${url}`, async () => {
      await this.page.goto(url);
    });
  }

  async clickElement(locator, name) {
    await this.step(`Клик по элементу: "${name}"`, async () => {
      await expect(locator).toBeVisible();
      await locator.click();
    });
  }

  async fillField(locator, value, name) {
    await this.step(`Заполнение поля "${name}" значением "${value}"`, async () => {
      await expect(locator).toBeVisible();
      await locator.fill(value);
    });
  }

  async getElementText(locator, name) {
    return await this.step(`Получение текста из "${name}"`, async () => {
      await expect(locator).toBeVisible();
      return await locator.textContent();
    });
  }

  // Проверка видимости элемента
  async verifyElementVisible(locator, elementName) {
    return await this.step(`Проверка видимости элемента: "${elementName}"`, async () => {
      try {
        await expect(locator).toBeVisible();
      } catch (error) {
        console.error(`❌ Элемент "${elementName}" не найден на странице!`);
        throw error;
      }
    });
  }

  // Проверка текста уведомления
  async verifyNotificationText(expectedText) {
    await this.step(`Проверка текста уведомления: "${expectedText}"`, async () => {
      await expect(this.toastMessage).toBeVisible();
      await expect(this.toastMessage).toContainText(expectedText);
    });
  }

  // Ожидание скрытия уведомления
  async waitForNotificationToHide() {
    return await this.step('Ожидание скрытия уведомления', async () => {
      await expect(this.toastMessage).toBeHidden({ timeout: 10000 });
    });
  }

  async step(description, action) {
    const { test } = require('@playwright/test'); 
    try {
        return await test.step(description, action);
    } catch (e) {
        console.log(`[LOG]: ${description}`);
        return await action();
    }
  }
};

module.exports = { BasePage };