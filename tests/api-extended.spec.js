const { test, expect } = require('@playwright/test');

test.describe('Extended API Tests', () => {
  const API_URL = 'http://localhost:3000'; 

  test('GET /product: Должен возвращать список всех товаров', async ({ request }) => {
    const response = await request.get(`${API_URL}/product`);
    
    expect(response.status()).toBe(200);

    const body = await response.json();

    expect(Array.isArray(body)).toBeTruthy();
    expect(body.length).toBeGreaterThanOrEqual(50); 
    
    expect(body[0]).toHaveProperty('id');
    expect(body[0]).toHaveProperty('name');
    expect(body[0]).toHaveProperty('price');
  });

  test('POST /auth/login: Авторизация возвращает токен доступа', async ({ request }) => {
    const response = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: 'user1@test.com',
        password: 'user123'
      }
    });

    expect(response.status()).toBe(201);

    const body = await response.json();

    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('email', 'user1@test.com');
    expect(body).toHaveProperty('role', 'USER');
  });

  test('GET /warehouse: Цепочка API-запросов (Логин -> Доступ к закрытому эндпоинту складов)', async ({ request }) => {
    await request.post(`${API_URL}/auth/login`, {
      data: {
        email: 'admin@test.com',
        password: 'admin123'
      }
    });

    // запрашиваем закрытый эндпоинт складов
    const warehouseResponse = await request.get(`${API_URL}/warehouse`);

    // проверяем, что доступ разрешен и вернулся массив складов
    expect(warehouseResponse.status()).toBe(200);
    const warehouseBody = await warehouseResponse.json();
    expect(Array.isArray(warehouseBody)).toBeTruthy();
  });

  test('GET /product/{id}: Динамическое получение конкретного товара', async ({ request }) => {
    // получаем список всех товаров
    const allProductsRes = await request.get(`${API_URL}/product`);
    const allProducts = await allProductsRes.json();

    // берем ID первого товара
    const targetId = allProducts[0].id;

    // запрос к API по ID
    const singleProductRes = await request.get(`${API_URL}/product/${targetId}`);
    expect(singleProductRes.status()).toBe(200);

    const product = await singleProductRes.json();

    // проверяем, что сервер вернул именно тот товар, который мы запросили
    expect(product).toHaveProperty('id', targetId);
    expect(product).toHaveProperty('name', allProducts[0].name);
  });

  test('GET /order: Негативный тест — доступ без авторизации (SECURITY BUG)', async ({ request }) => {
    test.fail(true, 'Баг безопасности: эндпоинт /order открыт для всех и отдает 200 OK вместо 401');

    const response = await request.get(`${API_URL}/order`);

    expect(response.status()).toBe(401);
  });

  test('POST & GET /order/{userId}: Полный цикл создания и получения заказа пользователя', async ({ request }) => {
    const loginRes = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: 'user1@test.com',
        password: 'user123'
      }
    });
    expect(loginRes.status()).toBe(201);
    const userBody = await loginRes.json();
    const userId = userBody.id;

    // получаем список товаров и берем ID первого товара для заказа
    const productsRes = await request.get(`${API_URL}/product`);
    const products = await productsRes.json();
    const productId = products[0].id;

    // создаем новый заказ для пользователя
    const createOrderRes = await request.post(`${API_URL}/order/${userId}`, {
      data: {
        items: [
          {
            product_id: productId,
            quantity: 2
          }
        ]
      }
    });
    expect(createOrderRes.status()).toBe(201);

    // запрашиваем историю заказов этого пользователя
    const getOrdersRes = await request.get(`${API_URL}/order/${userId}`);
    expect(getOrdersRes.status()).toBe(200);

    const userOrders = await getOrdersRes.json();
    
    // проверяем, что вернулся массив и в нем есть хотя бы один заказ
    expect(Array.isArray(userOrders)).toBeTruthy();
    expect(userOrders.length).toBeGreaterThan(0);
  });

});