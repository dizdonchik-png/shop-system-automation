const { test, expect } = require('@playwright/test');

const { LoginPage } = require('../pages/LoginPage');
const { AdminPage } = require('../pages/AdminPage');

test.describe('Admin Panel Module', () => {

  // Логинимся под АДМИНОМ
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login('admin@test.com', 'admin123'); 
    await expect(page).toHaveURL('/');

    const adminPage = new AdminPage(page);
    await adminPage.navigate();
  });

  test('TC#1: Return to Main Page via Header @TC1', async ({ page }) => {
    const adminPage = new AdminPage(page);
    await adminPage.goToMainPage();
  });

  test('TC#2: Logout from Admin Panel @TC2', async ({ page }) => {
    const adminPage = new AdminPage(page);
    await adminPage.logout();
  });

  test('TC#3: Dashboard Overview content @TC3', async ({ page }) => {
    await expect(page).toHaveURL('/admin');
    const welcomeMessage = page.locator('div.font-semibold.leading-none.tracking-tight', { hasText: 'Добро пожаловать!' });
    await expect(welcomeMessage).toBeVisible();
  });

  test('TC#4: Create a new product @TC4', async ({ page }) => {
    const adminPage = new AdminPage(page);
    await adminPage.openProductsTab();

    const uniqueId = Date.now();
    const productName = `Auto Product ${uniqueId}`;

    await adminPage.createProduct({
      name: productName,
      price: 999,
      description: 'AQA Test Description',
      urlImage: 'https://placehold.co/600x400',
      category: 'Электроника'
    });

    const toastText = await adminPage.getNotificationText();
    expect(toastText).toContain('Товар успешно создан');
  });

  test('TC#5: Edit existing product details @TC5', async ({ page }) => {
    const adminPage = new AdminPage(page);
    await adminPage.openProductsTab();

    const uniqueId = Date.now();
    const productName = `To Edit ${uniqueId}`;
    await adminPage.createProduct({ 
      name: productName,
      price: 999,
      description: 'AQA Test Description',
      urlImage: 'https://placehold.co/600x400',
      category: 'Одежда'
    });
    
    await expect(adminPage.toastMessage).toBeVisible();
    await expect(adminPage.toastMessage).toBeHidden({ timeout: 10000 }); 

    await adminPage.editProductPrice(productName, 250);

    const toastTextUpdate = await adminPage.getNotificationText();
    expect(toastTextUpdate).toContain('Товар успешно обновлен');
  });

  test('TC#6: Delete Product @TC6', async ({ page }) => {
    const adminPage = new AdminPage(page);
    await adminPage.openProductsTab();

    const uniqueId = Date.now();
    const productName = `To Delete ${uniqueId}`;
    await adminPage.createProduct({ 
      name: productName,
      price: 999,
      description: 'AQA Test Description',
      urlImage: 'https://placehold.co/600x400',
      category: 'Одежда' 
    });
    
    await expect(adminPage.toastMessage).toBeVisible();
    await expect(adminPage.toastMessage).toBeHidden({ timeout: 10000 }); 

    await adminPage.deleteProduct(productName);

    const toastText = await adminPage.getNotificationText();
    expect(toastText).toContain('Товар удален');
  });

  test('TC#7: Create a new warehouse @TC7', async ({ page }) => {
    const adminPage = new AdminPage(page);
    await adminPage.openWarehouses();

    const uniqueId = Date.now();
    await adminPage.createWarehouseButton.click();
    await adminPage.warehouseNameInput.fill(`Склад ${uniqueId}`);
    await adminPage.warehouseAddressInput.fill(`Адрес ${uniqueId}`);
    await adminPage.saveButton.click();

    const toastText = await adminPage.getNotificationText();
    expect(toastText).toContain('Склад создан');
  });

  test('TC#8: Update Order Status @TC8', async ({ page }) => {
    const adminPage = new AdminPage(page);
    await adminPage.openOrders();

    const firstOrderRow = page.getByRole('row').nth(1); 
    
    const statusDropdown = firstOrderRow.getByRole('combobox');
    await statusDropdown.click();
    
    await page.getByRole('option', { name: 'DELIVERED' }).click();

    await expect(firstOrderRow).toContainText('DELIVERED');

    await page.reload();
    const reloadedOrderRow = page.getByRole('row').nth(1);
    await expect(reloadedOrderRow).toContainText('DELIVERED');
  });

});