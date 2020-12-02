import {c, load, View} from '../utils'

let next = 0
function getNext() {
  next ++
  return next
}

class TestView extends View {
  __html__ = '<span :watch="*|getNext()|text"></span>'
}

const props = {name: 'joe'}

test('Empty property notation always updates', () => {
  const div = load(TestView, props)
  expect(div).toShow('<span>1</span>')
  div.update()
  expect(div).toShow('<span>2</span>')
  div.update()
  expect(div).toShow('<span>3</span>')
})
