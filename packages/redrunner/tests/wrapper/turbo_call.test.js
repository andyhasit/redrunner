import {c, load, View, Wrapper} from '../utils'

class TestView extends View {
  __html__ = '<span :cls="SpecialWrapper" :watch="|..items|turbo"></span>'
}


class SpecialWrapper extends Wrapper {
  turbo(value) {
    this.e.textContent = 'ALICE'
    return this
  }
}

const props = {name: 'joe'}

test('Custom wrapper class is used', () => {
  const div = load(TestView, props)
  expect(div).toShow('<span>ALICE</span>')
})
