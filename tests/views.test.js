const {c, mnt, tidy, View} = require('./utils')


class TestView extends View {
  __html__ = '<span id=9></span>'
}

test('view works', () => {
  //console.log(TestView.prototype.__bv.toString())
  const el = mnt(TestView)
  expect(el.html).toBe(tidy('<span></span>'))
})