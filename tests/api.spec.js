const { test, expect } = require('@playwright/test');

test.describe('API (Swagger) Module', () => {

  test('TC#1: API Documentation (Swagger) should be accessible @TC1', async ({ page }) => {
    const response = await page.goto('http://localhost:3000/api-docs');

    expect(response.status()).toBe(200);

    await expect(page.getByRole('heading', { name: 'Shop System API' })).toBeVisible();
  });

});