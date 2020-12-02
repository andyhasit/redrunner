import {load, View} from '../utils'


class BaseModal extends View {
  __html__ = `
    <div>
      <div>{..title}</div>
      <stub:inner />
      <stub:footer />
    </div>
  `
  __stubs__ = {
    footer: `<span>{..footer}</span>`
  }
}


class CustomModal extends BaseModal {
  __stubs__ = {
    inner: `<span>{..content}</span>`
  }
}

test("View can use stubs defined in parent", () => {
  let div = load(CustomModal, {title: 'Confirm', content: 'Really?', footer: 'ok'})
  expect(div).toShow(`
    <div>
      <div>Confirm</div>
      <span>Really?</span>
      <span>ok</span>
    </div>
  `)

  // We must do this a second time to test a regression bug

  div = load(CustomModal, {title: 'Confirm', content: 'Really?', footer: 'ok'})
  expect(div).toShow(`
    <div>
      <div>Confirm</div>
      <span>Really?</span>
      <span>ok</span>
    </div>
  `)
})
