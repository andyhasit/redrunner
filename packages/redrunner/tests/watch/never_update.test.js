import {c, load, View} from '../utils'

let next = 0
function getNext(n) {
  next ++
  return next
}

class TestView extends View {
  __html__ = '<span :watch="|..getNext?|"></span>'
}


test('Empty property notation always updates', () => {
  const div = load(TestView)
  expect(div).toShow('<span>1</span>')
  div.update()
  expect(div).toShow('<span>1</span>')
  div.update()
  expect(div).toShow('<span>1</span>')
})
