import {c, load, View} from '../utils'


class TestView extends View {
  __html__ = `
    <div :as="x">
      <div>
        <span :as="y"></span>
      </div>
      <span :as="z"></span>
    </div>
  `
  init() {
    this.dom.x.css('x')
    this.dom.y.css('y')
    this.dom.z.css('z')
  }
}

test('Named elements saved correctly', () => {
  const div = load(TestView)
  expect(div).toShow(`
    <div class="x">
      <div>
        <span class="y"></span>
      </div>
      <span class="z"></span>
    </div>
  `)
})