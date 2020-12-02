import {c, load, View} from '../utils'


class TestView extends View {
  __html__ = `
    <div>
      <span id="{..id}" class="{..style}"></span>
    </div>
  `
  init() {
    this.style = 'warning'
  }
}

const props = {style: 'alert', id: 8}

test('Attributes display correct initial values', () => {
  const div = load(TestView, props)
  expect(div).toShow(`
    <div>
      <span id="8" class="alert"></span>
    </div>
  `)
})
