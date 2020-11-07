import {c, h, load, View} from '../utils'


const child1 = {name: 'jo'}


class TestView extends View {
  __html__ = html`
    <div :as="main">
    </div>
  `
  init() {
    this.dom.main.inner([
      this.nest(Child, child1),
      this.nest(Child, {name: 'alice'}),
      this.nest(Child, {name: 'jess'})
    ])
    super.init()
  }
}


class Child extends View {
  __html__ = '<span>{name}</span>'
}


test('Nest accepts props', () => {
  const div = load(TestView)
  expect(div).toShow(`
    <div>
      <span>jo</span>
      <span>alice</span>
      <span>jess</span>
    </div>
  `)
  child1.name = 'ems'
  div.update()
  expect(div).toShow(`
    <div>
      <span>ems</span>
      <span>alice</span>
      <span>jess</span>
    </div>
  `)
})