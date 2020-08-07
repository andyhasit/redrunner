import {c, load, View} from '../utils'


function toUpper(n) {
  return n.toUpperCase()
}

class TestView extends View {
  __html__ = `
  	<div>
    	<span :watch="name||text"></span>
      <span :watch="name|..toUpper|text"></span>
    </div>
  `
}

const props = {name: 'joe'}

test('Basic watch updates text', () => {
  const div = load(TestView, props)
  expect(div).toShow(`
  	<div>
	    <span>joe</span>
	    <span>JOE</span>
    </div>
  `)
})
