const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');

class Header extends BasePage {
  constructor(page) {
    super(page);

    // Логотип
    this.logoLink = page.getByRole('link', { name: 'Shop System' });

    // Ссылка на Корзину
    this.cartLink = page.locator('a[href="/cart"]');

    // Ссылка "Заказы" (в шапке)
    this.ordersLink = page.getByRole('link', { name: 'Заказы' });

    // Кнопка с аватаркой/именем, которая открывает меню.
    this.userMenuButton = page.locator('button[aria-haspopup="menu"]');

    // Элементы внутри меню (видны только после клика по userMenuButton)
    this.profileMenuItem = page.getByRole('menuitem', { name: 'Профиль' });
    this.ordersMenuItem = page.getByRole('menuitem', { name: 'История заказов' });
    this.logoutMenuItem = page.getByRole('menuitem', { name: 'Выйти' });
  }

  // Переход в Корзину
  async openCart() {
    await this.clickElement(this.cartLink, 'Иконка корзины');
    await expect(this.page).toHaveURL('/cart');
  }

  // Переход на Главную через логотип
  async navigateHome() {
    await this.logoLink.click();
    await expect(this.page).toHaveURL('/');
  }

  // --- Методы для работы с выпадающим меню ---

  // 1. Перейти в Профиль
  async openProfile() {
    await this.step('Переход в профиль через меню', async () => {
      await this.clickElement(this.userMenuButton, 'Меню пользователя');
      await this.clickElement(this.profileMenuItem, 'Пункт Профиль');
      await expect(this.page).toHaveURL('/profile');
    });
  }

  // 2. Перейти в Историю заказов
  async openOrders() {
    await this.userMenuButton.click();
    await this.ordersMenuItem.click();
    await expect(this.page).toHaveURL('/orders');
  }

  // 3. Выйти из системы
  async logout() {
    await this.step('Выход из системы', async () => {
      await this.clickElement(this.userMenuButton, 'Меню пользователя');
      await this.clickElement(this.logoutMenuItem, 'Пункт Выйти');
      await expect(this.page).toHaveURL('/login');
    });
  }
}

module.exports = { Header };