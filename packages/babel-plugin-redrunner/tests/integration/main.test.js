// tests/snapshots/index-test.js
const {c, EOL, transform} = require('../utils')

const src = `
class MyView extends View {
  __html__ = '<div/>'
}
`

it('works', () => {
  const code = transform(src)
  expect(code).toMatchSnapshot()
});