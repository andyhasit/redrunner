import {c, h, load, View} from '../utils'

const names = ['joe', 'bob', 'alice']

class TestView extends View {
  __html__ = `
    <div :inner="*|.items">
    </div>
  `
  items() {
    return names.map(i => h('span', i))
  }
}

test('Nest without cache declaration adds wrappers', () => {
  const div = load(TestView)
  expect(div).toShow(`
    <div>
      <span>joe</span>
      <span>bob</span>
      <span>alice</span>
    </div>
  `)
})