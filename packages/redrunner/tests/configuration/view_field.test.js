import {c, h, load, View} from '../utils'

const data = {
  clicks: 0
}

class TestView extends View {
  clicked() {
    data.clicks ++
  }
}

test('Plugin finds html in views.html', () => {
  const div = load(TestView)
  const btn = div.el.childNodes[0]
  btn.click()
  expect(data.clicks).toEqual(1)
})
