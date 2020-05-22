import {c, mnt, tidy, View} from './utils'


class TestView extends View {
  __html__ = `<div>
    <span id="93"></span>
    </div>`
}


test('view works', () => {
  const el = mnt(TestView)
  expect(el.html).toBe(tidy(`
   <div><span id="93"></span> </div>`))
})
