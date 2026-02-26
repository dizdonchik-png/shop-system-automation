const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');

class AdminPage extends BasePage {
  constructor(page) {
    super(page);

    // Ссылка "Админ-панель"
    this.adminTitleLink = page.locator('a:has-text("Админ-панель")');

    // Кнопка "Выйти"
    this.logoutButton = page.getByRole('button', { name: 'Выйти' });

    // Вкладки в боковом меню
    this.overviewTab = page.locator('a[href="/admin"]');
    this.productsTab = page.locator('a[href="/admin/products"]');
    this.warehousesTab = page.locator('a[href="/admin/warehouses"]');
    this.ordersTab = page.locator('a[href="/admin/orders"]');

    // Кнопки действий
    this.createProductButton = page.getByRole('button', { name: 'Создать товар' });
    this.saveButton = page.getByRole('button', { name: 'Сохранить' });
    
    // --- Модальное окно (Создание/Редактирование) ---
    this.nameInput = page.locator('input[name="name"]');
    this.descriptionInput = page.locator('input[name="description"]');
    this.priceInput = page.locator('input[name="price"]');
    this.imageInput = page.locator('input[name="urlImage"]');
    this.categoryDropdown = page.getByRole('combobox');

    this.saveButton = page.getByRole('button', { name: 'Сохранить' });
    this.cancelButton = page.getByRole('button', { name: 'Отмена' });

    // --- Раздел "Склады" ---
    this.createWarehouseButton = page.getByRole('button', { name: 'Создать склад' });
    this.warehouseNameInput = page.getByLabel('Название склада');
    this.warehouseAddressInput = page.getByLabel('Адрес');

    // Уведомления
    this.toastMessage = page.locator('[data-sonner-toast] [data-title]').first();
  }

  // Переход в админку
  async navigate() {
    await this.open('/admin');
  }

  // Возврат на главную страницу через клик по "Админ-панель"
  async goToMainPage() {
    await this.adminTitleLink.click();
    await expect(this.page).toHaveURL('/');
  }

  // Переключение на вкладку "Товары"
  async openProductsTab() {
    await this.clickElement(this.productsTab, 'Вкладка Товары');
    await expect(this.page).toHaveURL(/\/admin\/products/);
  }

  // Переключение на вкладку "Склады"
  async openWarehouses() {
    await this.warehousesTab.click();
    await expect(this.page).toHaveURL(/\/admin\/warehouses/);
  }

  // Переключение на вкладку "Заказы"
  async openOrders() {
    await this.ordersTab.click();
    await expect(this.page).toHaveURL(/\/admin\/orders/);
  }

  // Выход из админ-панели
  async logout() {
    await this.logoutButton.click();
    await expect(this.page).toHaveURL('/login');
  }

  // Создать новый товар
  async createProduct(product) {
    await this.step(`Создание товара: ${product.name}`, async () => {
      await this.clickElement(this.createProductButton, 'Кнопка Создать товар');

      await this.fillField(this.nameInput, product.name, 'Название товара');
      await this.fillField(this.priceInput, product.price.toString(), 'Цена');

      if (product.description) await this.fillField(this.descriptionInput, product.description, 'Описание');
      if (product.urlImage) await this.fillField(this.imageInput, product.urlImage, 'URL картинки');

      if (product.category) {
        await this.clickElement(this.categoryDropdown, 'Выпадающий список категорий');
         await this.clickElement(this.page.getByRole('option', { name: product.category }), `Категория ${product.category}`);
      }

      await this.clickElement(this.saveButton, 'Кнопка Сохранить');
    });
  }

  // Удаление товара
  async deleteProduct(productName) {
    await this.step(`Удаление товара "${productName}"`, async () => {
      const row = this.page.getByRole('row').filter({ hasText: productName });
      const deleteBtn = row.getByRole('button', { name: 'Удалить' });
      await this.clickElement(deleteBtn, 'Кнопка Удалить');
    });
  }

  // Редактирование товара
  async editProductPrice(productName, newPrice) {
    await this.step(`Изменение цены товара "${productName}" на ${newPrice}`, async () => {
      const row = this.page.getByRole('row').filter({ hasText: productName });
      
      await row.getByRole('button').first().click(); 

      await this.fillField(this.priceInput, newPrice.toString(), 'Поле Цена');
      await this.clickElement(this.saveButton, 'Кнопка Сохранить');
    });
  }

  // Получить текст уведомления
  async getNotificationText() {
    return await this.getElementText(this.toastMessage, 'Уведомление админки');
  }
};

module.exports = { AdminPage };