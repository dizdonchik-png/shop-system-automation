const { expect } = require('@playwright/test');

class CartPage {
  constructor(page) {
    this.page = page;

    // Заголовок H1
    this.title = page.getByRole('heading', { name: 'Ваша Корзина' });
    
    // Блок с итоговой ценой
    this.totalPrice = page.locator('div').filter({ hasText: /^Итого:/ }).locator('span').last();
    this.checkoutButton = page.getByRole('button', { name: 'Оформить заказ' });

    // Локатор для всех строк товаров в корзине
    this.cartItemRow = page.locator('div.flex.items-center.justify-between.p-4.border-b');

    this.emptyMessage = page.getByText('Ваша корзина пуста');

    // Уведомления
    this.toastMessage = page.locator('[data-sonner-toast] [data-title]');
  }

  async navigate() {
    await this.page.goto('/cart');
  }

  // Метод для удаления товара из корзины
  async removeItem(productName) {
    const row = this.cartItemRow.filter({
      has: this.page.locator('h4', { hasText: productName })
    });
    await row.getByRole('button', { name: 'Удалить' }).click();
    await expect(row).toBeHidden();
  }

  // Получение текста итоговой суммы
  async getTotalPrice() {
    return await this.totalPrice.textContent();
  }

  // Оформление заказа
  async clickCheckout() {
    await expect(this.checkoutButton).toBeEnabled(); 
    await this.checkoutButton.click();
    await expect(this.page).toHaveURL('/');
  }

  // Проверка, что корзина пуста
  async isEmpty() {
    return await this.emptyMessage.isVisible();
  }

  // Получить текст уведомления
  async getNotificationText() {
    await expect(this.toastMessage).toBeVisible();
    return await this.toastMessage.textContent();
  }
}

module.exports = { CartPage };