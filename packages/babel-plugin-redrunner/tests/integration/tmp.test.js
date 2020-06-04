const {c, EOL, transform} = require('../utils')


test('__clone__ instead of __html__', () => {
  const src = `
  class MyView extends View {
    __clone__ = '<div/>'
  }`
  expect(transform(src)).toMatchSnapshot()
});
