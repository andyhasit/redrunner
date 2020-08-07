import {c, load, View} from '../utils'


function setSpan(n,o,w) {
  w.text(n.toUpperCase()).css('alert')
}

class TestView extends View {
  __html__ = `
  	<div>
      <span :watch="name|..setSpan"></span>
    </div>
  `
}

const props = {name: 'joe'}

test('Watch with no target updates element', () => {
  const div = load(TestView, props)
  expect(div).toShow(`
  	<div>
	    <span class="alert">JOE</span>
    </div>
  `)
})
