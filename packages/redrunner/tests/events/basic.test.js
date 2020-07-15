import {c, h, load, View} from '../utils'

const data = {
  clicks: 0
}

class TestView extends View {
  __html__ = `
    <div>
      <button :onclick=".clicked">Go</button>
    </div>
  `
  clicked() {
    data.clicks ++
  }
}

test('On click event works', () => {
  const div = load(TestView)
  const btn = div.el.childNodes[0]
  btn.click()
  expect(data.clicks).toEqual(1)
})