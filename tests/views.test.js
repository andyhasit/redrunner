import {c, mnt, tidy, View} from './utils'


class TestView extends View {
  __html__ = '<span id=9></span>'
}


test('view works', () => {
  const el = mnt(TestView)
  expect(el.html).toBe(tidy('<span id="9"></span>'))
})
