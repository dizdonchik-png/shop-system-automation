const { test, expect } = require('@playwright/test');

const { USER } = require('../test-data/credentials'); 
const { TEST_PRODUCTS } = require('../test-data/products'); 
const { loginAs } = require('../test-data/helpers'); 

const { CatalogPage } = require('../pages/CatalogPage');
const { Header } = require('../pages/Header');
const { LoginPage } = require('../pages/LoginPage');

test.describe('Main Page & Catalog Module', () => {

  test.beforeEach(async ({ page }) => {
    await loginAs(page, USER); 
  });

  test('TC#1: Catalog should display all seeded products @TC1', async ({ page }) => {
    const catalogPage = new CatalogPage(page);
    await catalogPage.navigate();
    
    // проверяем видимость каталога
    await catalogPage.verifyCatalogLoaded();
  });

  test('TC#2: User should be able to navigate to Home page via Logo @TC2', async ({ page }) => {
    const header = new Header(page);
    await header.openOrders();
    await header.navigateHome();
  });

  test('TC#3: Verify product details load correctly @TC3', async ({ page }) => {
    const catalogPage = new CatalogPage(page);
    await catalogPage.navigate();
    
    // создаем случайный индекс
    const randomIndex = await catalogPage.getRandomProductCardIndex();
    // получаем данные случайной карточки товара
    const productData = await catalogPage.getProductDetailsFromCatalog(randomIndex);
    
    // переходим на страницу данной карточки
    await catalogPage.openProductByIndex(randomIndex);
    
    // Сравниваем данные
    await catalogPage.verifyProductDetailsLoadCorrectly(productData);
  });

  test('TC#4: Product page should handle broken/missing images @TC4', async ({ page }) => {
    const catalogPage = new CatalogPage(page);
    await catalogPage.navigate();
    
    await catalogPage.openProductDetails(TEST_PRODUCTS.UNIQLO);
    
    // проверяем наличие кнопки "Добавить в корзину"
    await catalogPage.verifyAddToCartButtonVisible();
  });

  test('TC#5: System should handle access to non-existent product ID @TC5', async ({ page }) => {
    const catalogPage = new CatalogPage(page);
    
    await catalogPage.navigateToProductById('999999');
    await catalogPage.verifyNonExistentProductError();
  });

});