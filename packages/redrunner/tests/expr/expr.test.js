import {c, load, View} from '../utils'


class TestView extends View {
  __html__ = `
    <div>
      <span>{.age|(n * 2)}</span>
    </div>
  `
  init() {
    this.age = 4
  }
}

test('Expression syntax works', () => {
  const div = load(TestView)
  expect(div).toShow(`
    <div>
      <span>8</span>
    </div>
  `)
})