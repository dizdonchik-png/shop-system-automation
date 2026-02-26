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