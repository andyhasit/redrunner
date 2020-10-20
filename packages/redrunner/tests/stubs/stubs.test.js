import {c, h, load, View} from '../utils'


const caps = (n, o) => n.toUpperCase()
const person = {name: 'Hortense'}

class BaseModal extends View {
  __html__ = `
    <div>
  	  <div>{{title}}</div>
      <stub:inner />
    </div>
  `
}

class CustomModal extends BaseModal {
  __stubs__ = {
    inner: `<span>{{content}}</span>`
  }
}

test("CustomModal shows correct content", () => {
  const div = load(CustomModal, {title: 'Confirm', content: 'Really?'})
  expect(div).toShow(`
  	<div>
	    <div>Confirm</div>
      <span>Really?</span>
    </div>
  `)
})
