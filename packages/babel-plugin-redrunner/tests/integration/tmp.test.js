const {c, EOL, transform} = require('../utils')


test('__clone__ instead of __html__', () => {
  const src = `
  class MyComponent extends Component {
    __clone__ = '<div/>'
  }`
  expect(transform(src)).toMatchSnapshot()
});
