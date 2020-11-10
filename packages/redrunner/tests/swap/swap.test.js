import { h } from '../../src/utils'
import {c, load, View} from '../utils'


class TestView extends View {
  __html__ = `<div :swap="choice|..mappings|..myFallback"></div>`
}


class ViewA extends View {
  __html__ = `<span>A</span>`
}

class ViewB extends View {
  __html__ = `<span>B</span>`
}

const mappings = {
  a: ViewA,
  b: ViewB,
}

const myFallback = k => h('span').text(k)

const props = {choice: 'a'}

test('Swap syntax works', () => {
  const div = load(TestView, props)
  expect(div).toShow(`
    <div>
      <span>A</span>
    </div>
  `)
  props.choice = 'b'
  div.update()
  expect(div).toShow(`
    <div>
      <span>B</span>
    </div>
  `)
  props.choice = 'yo'
  div.update()
  expect(div).toShow(`
    <div>
      <span>yo</span>
    </div>
  `)
})