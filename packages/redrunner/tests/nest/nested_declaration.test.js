import {load, View} from '../utils'


class Child extends View {
  __html__ = '<span>{name}</span>'
}

class TestView extends View {
  __html__ = html`
    <div>
      <use:Child :props="..child1">
      <use:Child :props=".child2"/>
      <use=Child :props=".child3?">
      <use=Child :props="..child4Props?">
    </div>
  `
  init() {
    this.child2 = {name: 'alice'}
    super.init()
  }
  child3(me) {
    args3 = me
    return {name: 'jess'}
  }
}


let args3 = undefined
let args4 = undefined
const child1 = {name: 'jo'}
const child4 = {name: 'ja'}
function child4Props (me) {
  args4 = me
  return child4
}  




test('Nest accepts props', () => {
  const div = load(TestView)
  expect(div).toShow(`
    <div>
      <span>jo</span>
      <span>alice</span>
      <span>jess</span>
      <span>ja</span>
    </div>
  `)
  child1.name = 'ems'
  child4.name = 'boo'
  div.update()
  expect(div).toShow(`
    <div>
      <span>ems</span>
      <span>alice</span>
      <span>jess</span>
      <span>boo</span>
    </div>
  `)
  expect(args3).toEqual(div.view)
  expect(args4).toEqual(div.view)
})