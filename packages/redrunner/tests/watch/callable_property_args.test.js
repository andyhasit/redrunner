import {c, load, View} from '../utils'


function getCss(props, view) {
  return `${view.size} ${props.color}`
}

class TestView extends View {
  __html__ = `
    <div>
      <span :watch="..getCss?||css"></span>
      <span class="{..getCss?}"></span>
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
