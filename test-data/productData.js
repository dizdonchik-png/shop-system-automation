function generateTestProduct() {
  const timestamp = Date.now();
  return {
    name: `Auto Product ${timestamp}`,
    description: 'AQA Test Description',
    price: '250',
    urlImage: 'https://placehold.co/600x400',
    category: 'Одежда'
  };
}

module.exports = { generateTestProduct };