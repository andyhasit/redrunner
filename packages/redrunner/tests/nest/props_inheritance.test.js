import {load, View} from '../utils'

class TestView extends View {
  __html__ = html`
    <div>
      <div :as="main"></div>
      <div><use:Child></div>
    </div>
  `
  init() {
    this.dom.main.child(this.nest(Child))
    super.init()
  }
}


class Child extends View {
  __html__ = '<span>{name}</span>'
}


test('Nest passes parent props by default', () => {
  const props = {name: 'jo'}
  const div = load(TestView, props)
  expect(div).toShow(`
    <div>
      <div><span>jo</span></div>
      <div><span>jo</span></div>
    </div>
  `)
  props.name = 'ja'
  div.update()
  expect(div).toShow(`
    <div>
      <div><span>ja</span></div>
      <div><span>ja</span></div>
    </div>
  `)
})