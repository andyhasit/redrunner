import {load, View} from '../utils'

class BaseModal extends View {
  __html__ = `
    <div>
      <div>{title}</div>
      <stub:inner />
    </div>
  `
}

class CustomModal extends BaseModal {
  __stubs__ = {
    inner: `<span :as="x"></span>`
  }
  init() {
    this.dom.inner.dom.x.text('YO')
  }
}

test("Save as works in stub", () => {
  const div = load(CustomModal, {title: 'Confirm', content: 'Really?'})
  expect(div).toShow(`
    <div>
      <div>Confirm</div>
      <span>YO</span>
    </div>
  `)
})