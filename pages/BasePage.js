const { expect } = require('@playwright/test');

class BasePage {
  constructor(page) {
    this.page = page;
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

  async step(description, action) {
    const { test } = require('@playwright/test'); 
    try {
        await test.step(description, action);
    } catch (e) {
        console.log(`[LOG]: ${description}`);
        await action();
    }
  }
};

module.exports = { BasePage };