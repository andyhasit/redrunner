import {c, load, View} from '../utils'


class TestView extends View {
  __html__ = `
    <div :el="x">
      <div>
        <span :el="y"></span>
      </div>
      <span :el="z"></span>
    </div>
  `
  init() {
    this.el.x.css('x')
    this.el.y.css('y')
    this.el.z.css('z')
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