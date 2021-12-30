const {c, EOL, transform} = require('../utils')


test('Empty div created correct HTML', () => {
  const src = `
  class MyComponent extends Component {
    __html__ = '<div/>'
  }`
  expect(transform(src)).toMatchSnapshot()
});


test('__clone__ instead of __html__', () => {
  const src = `
  class MyComponent extends Component {
    __clone__ = '<div/>'
  }`
  expect(transform(src)).toMatchSnapshot()
});
