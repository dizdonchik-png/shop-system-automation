const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');

class CartPage extends BasePage {
  constructor(page) {
    super(page);

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
    await this.open('/cart');
  }

  // Метод для удаления товара из корзины
  async removeItem(productName) {
    await this.step(`Удаление товара "${productName}" из корзины`, async () => {
      const row = this.cartItemRow.filter({
        has: this.page.locator('h4', { hasText: productName })
      });
      const deleteBtn = row.getByRole('button', { name: 'Удалить' });
        await this.clickElement(deleteBtn, `Кнопка Удалить для ${productName}`);

      await expect(row).toBeHidden();
    });
  }

  // Получение текста итоговой суммы
  async getTotalPrice() {
    return await this.getElementText(this.totalPrice, 'Итоговая цена');
  }

  // Оформление заказа
  async clickCheckout() {
    await this.step('Оформление заказа', async () => {
      await expect(this.checkoutButton).toBeEnabled(); 
      await this.clickElement(this.checkoutButton, 'Кнопка Оформить заказ');
      await expect(this.page).toHaveURL('/');
    });
  }

  // Проверка, что корзина пуста
  async isEmpty() {
    return await this.emptyMessage.isVisible();
  }

  // Получить текст уведомления
  async getNotificationText() {
    return await this.getElementText(this.toastMessage, 'Уведомление корзины');
  }
}

module.exports = { CartPage };