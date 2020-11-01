import {c, load, View} from '../utils'


class TestView extends View {
  __html__ = `
    <div>
      <span>{{.count}}</span>
      <use:Button>
    </div>
  `
  init() {
    this.count = 0
  }
  add(by) {
    this.count += by
    this.update()
  }
}


class Button extends View {
  __html__ = `
    <button :onClick=".clicked">Go</button>
  `
  clicked() {
    this.bubble('add', 2)
  }
}

test('bubble function as expeted', () => {
  const view = load(TestView)
  const btn = view.el.childNodes[1]
  expect(view).toShow(`
    <div>
      <span>0</span>
      <button>Go</button>
    </div>
  `)
  btn.click()
  setTimeout(() => {
    expect(view).toShow(`
      <div>
        <span>2</span>
        <button>Go</button>
      </div>
    `)
  }, 50);
})