import {load, View} from '../utils'

class View1 extends View {
  __html__ = html`
    <div>meh</div>
  `
  yolo = 1
}


class View2 extends View {
  __html__ = html`
    <div>meh</div>
  `
  __stubs__ = {
    footer: html`<span>{footer}</span>`
  }
  yolo = 2
}

test("Views retain class properties", () => {
  const div1 = load(View1)
  const div2 = load(View2)
  expect(div1.view.yolo).toBe(1)
  expect(div2.view.yolo).toBe(2)
})
