import {c, load, View, Wrapper} from '../utils'

class TestView extends View {
  __html__ = '<span :wrapper="SpecialWrapper" :watch="*|name.|text"></span>'
}


class SpecialWrapper extends Wrapper {
  text(value) {
    this.e.textContent = 'ALICE'
    return this
  }
}

const props = {name: 'joe'}

test('Custom wrapper class is used', () => {
  const div = load(TestView, props)
  expect(div).toShow('<span>ALICE</span>')
})
