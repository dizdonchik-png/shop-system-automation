const { test, expect } = require('@playwright/test');

const { CatalogPage } = require('../pages/CatalogPage');
const { Header } = require('../pages/Header');
const { LoginPage } = require('../pages/LoginPage');

test.describe('Main Page & Catalog Module', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login('user1@test.com', 'user123');
    await expect(page).toHaveURL('/');
  });

  test('TC#1: Catalog should display all seeded products @TC1', async ({ page }) => {
    const catalogPage = new CatalogPage(page);
    
    await catalogPage.navigate();
    
    await expect(catalogPage.pageTitle).toBeVisible();
    
    const productsCount = await catalogPage.productCard.count();
    expect(productsCount).toBe(50);
  });

  test('TC#2: User should be able to navigate to Home page via Logo @TC2', async ({ page }) => {
    const header = new Header(page);
    
    await page.goto('/cart');
    
    await header.navigateHome();
    
    await expect(page).toHaveURL('/');
  });

  test('TC#3: Verify product details load correctly @TC3', async ({ page }) => {
    const catalogPage = new CatalogPage(page);
    await catalogPage.navigate();
    
    const count = await catalogPage.productCard.count();
    const randomIndex = Math.floor(Math.random() * count);
    
    // Получаем случайную карточку товара с помощью метода
    const randomProductCard = catalogPage.productCard.nth(randomIndex);
    
    const catalogProductName = await randomProductCard.locator('div.font-semibold').textContent(); 
    const catalogProductDesc = await randomProductCard.locator('div.text-sm.text-muted-foreground').textContent();
    const catalogImageSrc = await randomProductCard.locator('img').getAttribute('src');
    
    await randomProductCard.click();
    await expect(page).toHaveURL(/\/product\/\d+/);
    
    // Сравниваем данные
    await expect(page.locator('h1.text-3xl')).toHaveText(catalogProductName.trim());
    await expect(page.locator('p.mt-2.text-muted-foreground')).toHaveText(catalogProductDesc.trim());
    await expect(page.locator('img.w-full.h-auto')).toHaveAttribute('src', catalogImageSrc);

    await expect(page.locator('p.text-3xl')).toBeVisible();

    await expect(page.getByRole('button', { name: 'Добавить в корзину' })).toBeVisible();
  });

  test('TC#4: Product page should handle broken/missing images @TC4', async ({ page }) => {
    const catalogPage = new CatalogPage(page);
    await catalogPage.navigate();
    
    await catalogPage.openProductDetails('Uniqlo Oxford');
    
    await expect(page.getByRole('button', { name: 'Добавить в корзину' })).toBeVisible();
  });

  test('TC#5: System should handle access to non-existent product ID @TC5', async ({ page }) => {
    await page.goto('/product/999999');
    
    await expect(page.getByText('Загрузка продукта...')).toBeVisible();

    const errorMessage = page.getByText('Ошибка: Не удалось загрузить продукт');
    await expect(errorMessage).toBeVisible({ timeout: 15000 }); 
    
    await expect(errorMessage).toHaveClass(/text-destructive/); 
  });

});