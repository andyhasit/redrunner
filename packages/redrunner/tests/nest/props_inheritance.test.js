import {load, View} from '../utils'

class TestView extends View {
  __html__ = html`
    <div>
      <div :el="main"></div>
      <div><use:Child :props="p"></div>
    </div>
  `
  init() {
    this.el.main.child(this.nest(Child))
    super.init()
  }
}


class Child extends View {
  __html__ = '<span>{..name}</span>'
}


test('Nest can access parent props', () => {
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