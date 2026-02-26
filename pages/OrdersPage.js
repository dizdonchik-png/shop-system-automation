const { expect } = require('@playwright/test');

class OrdersPage {
  constructor(page) {
    this.page = page;
    this.pageTitle = page.getByRole('heading', { name: 'Мои заказы' });
    this.lastOrder = page.locator('div.rounded-xl').last();

    // Локаторы внутри раскрытого заказа
    this.quantityText = page.locator('p.text-sm.text-muted-foreground').filter({ hasText: /1 x/ }).last();
    this.priceText = page.locator('div.font-medium').filter({ hasText: /руб\./ }).last();
  }

  // Проверка заголовка страницы
  async verifyOrdersPageLoaded() {
    await expect(this.pageTitle).toBeVisible();
  }

  // Проверка статуса нового заказа
  async verifyLastOrderStatus(status) {
    await expect(this.lastOrder).toContainText(/Заказ #\d+/);
    await expect(this.lastOrder).toContainText(status);
  }

  // Раскрытие деталей заказа
  async openLastOrderDetails() {
    await this.lastOrder.locator('button').first().click();
  }

  // Проверка содержимого заказа
  async verifyOrderDetailsContains(productName) {
    await expect(this.lastOrder).toContainText(productName);
    await expect(this.quantityText).toBeVisible();
    await expect(this.priceText).toBeVisible();
  }
}

module.exports = { OrdersPage };