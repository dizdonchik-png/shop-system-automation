function generateTestUser(overrides = {}) {
  const uniqueId = Date.now();
  return {
    firstName: 'Тест',
    lastName: 'Юзер',
    email: `newuser_${uniqueId}@test.com`,
    username: `user_${uniqueId}`,
    phone: '+79991234567',
    password: 'password123',
    ...overrides
  };
}

module.exports = { generateTestUser };