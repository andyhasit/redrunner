import {c, h, load, View} from '../utils'

const child1 = {name: 'jo'}


class Child extends View {
  __html__ = '<span>{{name}}</span>'
}


class TestView extends View {
  __html__ = `
    <div>
      <Child :props="..child1"/>
      <Child :props=".child2"/>
    </div>
  `
  init() {
    this.child2 = {name: 'alice'}
  }
}

test('Nest accepts props', () => {
  const div = load(TestView)
  expect(div).toShow(`
    <div>
      <span>jo</span>
      <span>alice</span>
    </div>
  `)
  child1.name = 'ems'
  div.update()
  expect(div).toShow(`
    <div>
      <span>ems</span>
      <span>alice</span>
    </div>
  `)
})