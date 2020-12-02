import {c, load, View} from '../utils'


function getCss(p, c) {
  return `${c.size} ${p.color}`
}

class TestView extends View {
  __html__ = `
    <div>
      <span :watch="getCss(p,c)||css"></span>
      <span class="{getCss(p,c)}"></span>
    </div>
  `
  init() {
    this.size = 'big'
  }
}

const props = {color: 'red'}

test('Basic watch updates text', () => {
  const div = load(TestView, props)
  expect(div).toShow(`
    <div>
      <span class="big red"></span>
      <span class="big red"></span>
    </div>
  `)
})
