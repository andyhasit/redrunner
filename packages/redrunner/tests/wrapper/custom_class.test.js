import {c, load, View, Wrapper} from '../utils'

class TestView extends View {
  __html__ = '<span :cls="SpecialWrapper" :watch="|name|"></span>'
}


class SpecialWrapper extends Wrapper {
  text(value) {
    this.e.textContent = 'ALICE'
    return this
  }
}

const props = {name: 'joe'}

test('Custom class is used', () => {
  const div = load(TestView, props)
  expect(div).toShow('<span>ALICE</span>')
})
