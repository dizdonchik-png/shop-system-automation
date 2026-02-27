const { test, expect } = require('@playwright/test');
const { ADMIN } = require('../test-data/credentials'); 

const { loginAs } = require('../test-data/helpers'); 
const { generateTestProduct, generateTestWarehouse } = require('../test-data/productData'); 

const { LoginPage } = require('../pages/LoginPage');
const { AdminPage } = require('../pages/AdminPage');

test.describe('Admin Panel Module', () => {

  // Логинимся под АДМИНОМ
  test.beforeEach(async ({ page }) => {
    await loginAs(page, ADMIN);

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
    const adminPage = new AdminPage(page);
    await adminPage.verifyDashboardLoaded();
  });

  test('TC#4: Create a new product @TC4', async ({ page }) => {
    const adminPage = new AdminPage(page);
    await adminPage.openProductsTab();

    const testProduct = generateTestProduct(); 
    await adminPage.createProduct(testProduct);

    await adminPage.verifyNotificationText('Товар успешно создан');
  });

  test('TC#5: Edit existing product details @TC5', async ({ page }) => {
    const adminPage = new AdminPage(page);
    await adminPage.openProductsTab();

    const testProduct = generateTestProduct(); 
    await adminPage.createProduct(testProduct);

    await adminPage.verifyNotificationText('Товар успешно создан');
    // ждем пока уведомление скроется
    await adminPage.waitForNotificationToHide();

    await adminPage.editProductPrice(testProduct.name, 250);

    await adminPage.verifyNotificationText('Товар успешно обновлен');
  });

  test('TC#6: Delete Product @TC6', async ({ page }) => {
    const adminPage = new AdminPage(page);
    await adminPage.openProductsTab();

    const testProduct = generateTestProduct();
    await adminPage.createProduct(testProduct);
    
    await adminPage.verifyNotificationText('Товар успешно создан');
    await adminPage.waitForNotificationToHide(); 

    await adminPage.deleteProduct(testProduct.name);

    await adminPage.verifyNotificationText('Товар удален');
  });

  test('TC#7: Create a new warehouse @TC7', async ({ page }) => {
    const adminPage = new AdminPage(page);
    await adminPage.openWarehouses();

    const newWarehouse = generateTestWarehouse();
    await adminPage.createWarehouse(newWarehouse.name, newWarehouse.address);
    
    await adminPage.verifyNotificationText('Склад создан');
  });

  test('TC#8: Update Order Status @TC8', async ({ page }) => {
    const adminPage = new AdminPage(page);
    await adminPage.openOrders();
    
    // Меняем статус во 2-й строке на DELIVERED
    await adminPage.updateOrderStatus(1, 'DELIVERED');
    await adminPage.verifyOrderStatus(1, 'DELIVERED');

    await page.reload();
    await adminPage.verifyOrderStatus(1, 'DELIVERED');
  });

});