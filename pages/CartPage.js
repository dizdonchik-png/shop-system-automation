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

    this.emptyMessage = page.getByText('Ваша корзина пуста.');

  }

  async navigate() {
    await this.open('/cart');
  }

  // Проверка редиректа на главную после успешного заказа
  async verifyRedirectToHome() {
    await expect(this.page).toHaveURL('/');
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
  async verifyCartIsEmpty() {
    await expect(this.emptyMessage).toBeVisible();
    await expect(this.totalPrice).toContainText('0');
    await expect(this.checkoutButton).toBeDisabled();
  }

  // Проверка корректного отображения содержимого корзины (когда она не пуста)
  async verifyCartContentLoaded() {
    await expect(this.title).toBeVisible();
    await expect(this.totalPrice).toBeVisible();
    await expect(this.checkoutButton).toBeEnabled();
    await expect(this.cartItemRow.first().getByRole('button', { name: 'Удалить' })).toBeVisible();
  }

  // Проверка, что конкретный товар отображается в корзине
  async verifyProductInCart(productName) {
    const itemRow = this.cartItemRow.filter({ hasText: productName });
    await expect(itemRow).toBeVisible();
  }

  // Проверка, что блок итоговой суммы не пустой
  async verifyTotalPriceNotEmpty() {
    await expect(this.totalPrice).not.toBeEmpty();
  }

  // Получение итоговой суммы в виде чистого числа
  async getNumericTotalPrice() {
    await expect(this.totalPrice).toBeVisible(); 
    const priceText = await this.totalPrice.textContent();
    return parseInt(priceText.replace(/\D/g, ''), 10);
  }

  // Умная проверка уменьшения цены
  async verifyTotalPriceDecreased(previousPrice) {
    await expect(async () => {
      const currentPrice = await this.getNumericTotalPrice();
      expect(currentPrice).toBeLessThan(previousPrice);
    }).toPass();
  }

}

module.exports = { CartPage };