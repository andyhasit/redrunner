import {load, View} from '../utils'


class TestView extends View {
  __html__ = html`
    <div :items=".items|Child">
    </div>
  `
  init() {
    this.name = 'jo'
    this.items = [1, 2, 3]
    super.init()
  }
}


class Child extends View {
  __html__ = '<span>{.parent.name}</span>'
}


test('Items are linked to parent', () => {
  const div = load(TestView)
  expect(div).toShow(`
    <div>
      <span>jo</span>
      <span>jo</span>
      <span>jo</span>
    </div>
  `)
})