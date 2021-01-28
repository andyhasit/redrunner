import {load, View} from '../utils'

class ViewWithOwnProps extends View {
  __html__ = html`
    <div>{..name}</div>
  `
  init() {
    this.props = {name: 'jo'}
    super.init()
  }
}

test("Mounted view can create own props", () => {
  const div = load(ViewWithOwnProps)
  expect(div).toShow(`
    <div>
      jo
    </div>
  `)
})

class View1 extends View {
  __html__ = html`
    <div>
      <use:ViewWithOwnProps />
    </div>
  `
}

test("View can create own props", () => {
  const div = load(View1)
  expect(div).toShow(`
  <div>
    <div>
      jo
    </div>
  </div>
  `)
})
