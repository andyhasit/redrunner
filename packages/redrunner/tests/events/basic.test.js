import {c, h, load, View} from '../utils'

const data = {
  clicks: 0
}

let args = undefined

class TestView extends View {
  __html__ = `
    <div>
      <button :el="btn" :onClick="..clicked">Go</button>
    </div>
  `
}

const clicked = (w, e, p, c) => {
  p.clicks ++
  args = {w, e, p, c}
}

test('On click event works', () => {
  const div = load(TestView, data)
  const btn = div.el.childNodes[0]
  btn.click()
  expect(data.clicks).toEqual(1)
  expect(args.w).toEqual(div.view.el.btn)
  expect(args.p).toEqual(data)
  expect(args.c).toEqual(div.view)
  const newData = {
    clicks: 10
  }
  // Ensure new props are used
  div.view.setProps(newData)
  btn.click()
  expect(data.clicks).toEqual(1)
  expect(newData.clicks).toEqual(11)
})
