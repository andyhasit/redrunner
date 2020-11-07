import {load, View} from '../utils'

const child1 = {name: 'jo'}


class Child extends View {
  __html__ = '<span>{name}</span>'
}


class TestView extends View {
  __html__ = html`
    <div>
      <use:Child :props="..child1">
      <use:Child :props=".child2"/>
      <use=Child :props=".child3?">
    </div>
  `
  init() {
    this.child2 = {name: 'alice'}
    super.init()
  }
  child3() {
    return {name: 'jess'}
  }
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