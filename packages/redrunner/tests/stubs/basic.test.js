import {load, View} from '../utils'

class BaseModal extends View {
  __html__ = `
    <div>
      <div>{..title}</div>
      <stub:inner />
    </div>
  `
}

class CustomModal extends BaseModal {
  __stubs__ = {
    inner: `<span>{..content}</span>`
  }
}

test("CustomModal uses parent props", () => {
  const div = load(CustomModal, {title: 'Confirm', content: 'Really?'})
  expect(div).toShow(`
    <div>
      <div>Confirm</div>
      <span>Really?</span>
    </div>
  `)
})

/**
 * This test is required to ensure that View.prototype.__av (which gets an anonymous view)
 * doesn't accidentally add stuff to the View.prototype, which it did in previous commit.
 */

class JustChecking extends View {}

test("We haven't broken View prototype", () => {
  const v = new JustChecking()
  expect(v.__ht).toBe(undefined)
  expect(v.__qc).toBe(undefined)
})