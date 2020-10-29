import {c, h, load, View} from '../utils'

const child1 = {name: 'jo'}
const props = {name: 'julie'}

class Child1 extends View {
  __html__ = '<span>{{..child1.name}}</span>'
}


class Child2 extends View {
  __html__ = '<span>ozzy</span>'
}

class Child3 extends View {
  __html__ = '<span>{{name}}</span>'
}


class TestView extends View {
  __html__ = `
    <div>
      <div :replace="..Child1"/>
      <div :replace=".getChild2Cls?"/>
      <div :replace=".getChild3Cls?|..props"/>
      <div :replace=".getChild3Cls?" :props="..props"/>
    </div>
  `
  getChild2Cls() {
    return Child2
  }
  getChild3Cls() {
    return Child3
  }
}

test('Replace uses correct child class', () => {
  const div = load(TestView)
  expect(div).toShow(`
    <div>
      <span>jo</span>
      <span>ozzy</span>
      <span>julie</span>
      <span>julie</span>
    </div>
  `)
  child1.name = 'liz'
  props.name = 'ali'
  div.update()
  expect(div).toShow(`
    <div>
      <span>liz</span>
      <span>ozzy</span>
      <span>ali</span>
      <span>ali</span>
    </div>
  `)
})