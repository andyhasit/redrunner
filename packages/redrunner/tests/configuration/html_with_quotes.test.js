import {c, load, View} from '../utils'


class TestView extends View {
  __html__ = `<div>Hi! my name's "Dave"</div>`
}

test('Quotes are handled correctly', () => {
  const div = load(TestView)
  expect(div).toShow(`
    <div>Hi! my name's "Dave"</div>
  `)
})