import {c, load, View} from '../utils'


function getName() {
  return 'alice'
}

class TestView extends View {
  __html__ = `
  	<div>
    	<span :watch="name||"></span>
      <span :watch=".name||"></span>
      <span :watch="..getName()||"></span>
    </div>
  `
  init() {
  	this.name = 'bob'
  }
}

const props = {name: 'joe'}

test('Lookup notation selects correct reference', () => {
  const div = load(TestView, props)
  expect(div).toShow(`
  	<div>
	    <span>joe</span>
	    <span>bob</span>
      <span>alice</span>
    </div>
  `)
})
