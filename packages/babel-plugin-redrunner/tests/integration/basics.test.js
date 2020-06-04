const {c, EOL, transform} = require('../utils')


test('Empty div created correct HTML', () => {
  const src = `
  class MyView extends View {
    __html__ = '<div/>'
  }`
  expect(transform(src)).toMatchSnapshot()
});


test('__clone__ instead of __html__', () => {
  const src = `
  class MyView extends View {
    __clone__ = '<div/>'
  }`
  expect(transform(src)).toMatchSnapshot()
});
