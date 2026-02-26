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

    // Локаторы для карточки товара в каталоге (внутренние элементы)
    this.productNameLocator = 'div.font-semibold';
    this.productDescLocator = 'div.text-sm.text-muted-foreground';
    this.productImageLocator = 'img';

    // Локаторы для страницы деталей товара (/product/:id)
    this.detailsTitle = page.locator('h1.text-3xl');
    this.detailsDesc = page.locator('p.mt-2.text-muted-foreground');
    this.detailsImage = page.locator('img.w-full.h-auto');
    this.detailsPrice = page.locator('p.text-3xl');
    this.addToCartButton = page.getByRole('button', { name: 'Добавить в корзину' });

    // Локаторы для страницы несуществующего товара
    this.loadingMessage = page.getByText('Загрузка продукта...');
    this.errorMessage = page.getByText('Ошибка: Не удалось загрузить продукт');

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
      const card = this.page.locator('a.group.flex').filter({ hasText: productName }).first();
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

  async verifyNotificationText(expectedText) {
    await expect(this.toastMessage.first()).toBeVisible();
    await expect(this.toastMessage.first()).toContainText(expectedText);
  }

  // Получить случайный индекс карточки
  async getRandomProductCardIndex() {
    const count = await this.productCard.count();
    return Math.floor(Math.random() * count);
  }

  // Считать данные товара из каталога по индексу
  async getProductDetailsFromCatalog(index) {
    const card = this.productCard.nth(index);
    const name = await card.locator(this.productNameLocator).textContent();
    const desc = await card.locator(this.productDescLocator).textContent();
    const imageSrc = await card.locator(this.productImageLocator).getAttribute('src');
    
    return { name: name.trim(), desc: desc.trim(), imageSrc };
  }

  // Кликнуть по товару по его индексу
  async openProductByIndex(index) {
    await this.productCard.nth(index).click();
    await expect(this.page).toHaveURL(/\/product\/\d+/);
  }

  // Проверить, что на странице деталей отображаются правильные данные
  async verifyProductDetailsLoadCorrectly(expectedData) {
    await expect(this.detailsTitle).toHaveText(expectedData.name);
    await expect(this.detailsDesc).toHaveText(expectedData.desc);
    await expect(this.detailsImage).toHaveAttribute('src', expectedData.imageSrc);
    await expect(this.detailsPrice).toBeVisible();
    await expect(this.addToCartButton).toBeVisible();
  }

  // Проверка отображения кнопки добавления в корзину
  async verifyAddToCartButtonVisible() {
    await expect(this.addToCartButton).toBeVisible();
  }

  // Переход по прямой ссылке на несуществующий товар
  async navigateToProductById(productId) {
    await this.page.goto(`/product/${productId}`);
  }

  // Проверка страницы с ошибкой 404/Not Found
  async verifyNonExistentProductError() {
    await expect(this.loadingMessage).toBeVisible();
    await expect(this.errorMessage).toBeVisible({ timeout: 15000 }); 
    await expect(this.errorMessage).toHaveClass(/text-destructive/); 
  }
}

module.exports = { CatalogPage };