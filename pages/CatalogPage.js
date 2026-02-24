const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');

class CatalogPage extends BasePage {
  constructor(page) {
    super(page);

    // Заголовок страницы "Каталог товаров"
    this.pageTitle = page.getByRole('heading', { name: 'Каталог товаров' });

    // Контейнер сетки товаров
    this.productsGrid = page.locator('div.grid');

    // Универсальный локатор для карточки товара
    this.productCard = page.locator('a.group.flex');

    this.toastMessage = page.locator('[data-sonner-toast] [data-title]').first();
  }

  async navigate() {
    await this.open('/');
  }

  // Проверка, что каталог загрузился
  async verifyCatalogLoaded() {
    await this.step('Проверка загрузки каталога', async () => {
      await expect(this.pageTitle).toBeVisible();
      await expect(this.productsGrid).toBeVisible();
    });
  }

  // Добавить товар в корзину по имени
  async addProductToCart(productName) {
    await this.step(`Добавление товара "${productName}" в корзину`, async () => {
      const card = this.page.locator('a.group.flex').filter({ hasText: productName });
      const addButton = card.locator('button', { name: 'В корзину' });
      
      await this.clickElement(addButton, `Кнопка "В корзину" для ${productName}`);
    });
  }

  // Клик по карточке товара для перехода к деталям
  async openProductDetails(productName) {
    await this.page.locator('a.group.flex', { hasText: productName }).click();
  }

  // Метод для проверки наличия товара в каталоге
  async isProductVisible(productName) {
    return await this.page.locator('a.group.flex', { hasText: productName }).isVisible();
  }

  async getNotificationText() {
    return await this.getElementText(this.toastMessage, 'Тоаст уведомление');
  }
}

module.exports = { CatalogPage };