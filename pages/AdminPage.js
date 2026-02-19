const { expect } = require('@playwright/test');

class AdminPage {
  constructor(page) {
    this.page = page;

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
    this.warehouseNameInput = page.locator('input[placeholder="Название склада"]');
    this.warehouseAddressInput = page.locator('input[placeholder="Адрес"]');

    // Уведомления
    this.toastMessage = page.locator('[data-sonner-toast] [data-title]');
  }

  // Переход в админку
  async navigate() {
    await this.page.goto('/admin');
  }

  // Возврат на главную страницу через клик по "Админ-панель"
  async goToMainPage() {
    await this.adminTitleLink.click();
    await expect(this.page).toHaveURL('/');
  }

  // Переключение на вкладку "Товары"
  async openProductsTab() {
    await this.productsTab.click();
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
    await this.createProductButton.click();

    await this.nameInput.fill(product.name);
    await this.priceInput.fill(product.price.toString());
    if (product.description) {
        await this.descriptionInput.fill(product.description);
    }
    if (product.urlImage) {
      await this.imageInput.fill(product.urlImage);
    }
    if (product.category) {
       await this.categoryDropdown.click();
       await this.page.getByRole('option', { name: product.category }).click();
    }

    await this.saveButton.click();
  }

  // Удаление товара
  async deleteProduct(productName) {
    const row = this.page.getByRole('row').filter({ hasText: productName });
    
    await row.getByRole('button').last().click();
  }

  // Редактирование товара
  async editProductPrice(productName, newPrice) {
    const row = this.page.getByRole('row').filter({ hasText: productName });
    
    await row.getByRole('button').first().click(); 

    await this.priceInput.fill(newPrice.toString());
    await this.saveButton.click();
  }

  // Получить текст уведомления
  async getNotificationText() {
    await expect(this.toastMessage).toBeVisible();
    return await this.toastMessage.textContent();
  }
};

module.exports = { AdminPage };