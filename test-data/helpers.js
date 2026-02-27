const { LoginPage } = require('../pages/LoginPage');

async function loginAs(page, credentials) {
  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  await loginPage.login(credentials.email, credentials.password);
  await loginPage.verifySuccessfulLogin();
}

module.exports = { loginAs };