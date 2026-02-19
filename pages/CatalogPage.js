const { expect } = require('@playwright/test');

class CatalogPage {
  constructor(page) {
    this.page = page;

    // Заголовок страницы "Каталог товаров"
    this.pageTitle = page.getByRole('heading', { name: 'Каталог товаров' });

    // Контейнер сетки товаров
    this.productsGrid = page.locator('div.grid');

    // Универсальный локатор для карточки товара
    this.productCard = page.locator('a.group.flex');

    this.toastMessage = page.locator('[data-sonner-toast] [data-title]');
  }

  async navigate() {
    await this.page.goto('/');
  }

  // Проверка, что каталог загрузился
  async verifyCatalogLoaded() {
    await expect(this.pageTitle).toBeVisible();
    await expect(this.productsGrid).toBeVisible();
  }

  // Добавить товар в корзину по имени
  async addProductToCart(productName) {
    const card = this.page.locator('div').filter({ hasText: productName }).first();
    await card.locator('button', { name: 'В корзину' }).click();
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
    await expect(this.toastMessage).toBeVisible();
    return await this.toastMessage.textContent();
  }
}

module.exports = { CatalogPage };