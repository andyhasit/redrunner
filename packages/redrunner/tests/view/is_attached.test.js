import {c, createView, load, View} from '../utils'


class TestView extends View {
  __html__ = `
    <div :as="root">
    </div>
  `
}

class NestedView extends View {
  __clone__ = `
    <span>{.props}</span>
  `
}


test('Top views should be attached', () => {
  const div = load(TestView)
  expect(div.view.__ia()).toBe(true)
})


test('Nested views should not be attached until it is', () => {
  const parentView = load(TestView).view
  const randomView = createView(NestedView, undefined, parentView)
  expect(randomView.__ia()).toBe(false)
  parentView.dom.root.child(randomView)
  expect(randomView.__ia()).toBe(true)
})
