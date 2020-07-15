import {c, load, View} from '../utils'

const props = {
  name: 'bob',
  foo: function(n) {
    return `${n} from props`
  }
}

function foo(n) {
  return `${n} from global`
}

class TestView extends View {
  __html__ = `
  	<div>
    	<span>{{name|foo}}</span>
      <span>{{name|.foo}}</span>
      <span>{{name|..foo}}</span>
    </div>
  `
  foo(n) {
  	return `${n} from this`
  }
}


test('Convert functions called on load', () => {
  const div = load(TestView, props)
  expect(div).toShow(`
  	<div>
	    <span>bob from props</span>
      <span>bob from this</span>
      <span>bob from global</span>
    </div>
  `)
})

test('Convert functions called on update', () => {
  const div = load(TestView, props)
  props.name = 'jane'
  div.update()
  expect(div).toShow(`
    <div>
      <span>jane from props</span>
      <span>jane from this</span>
      <span>jane from global</span>
    </div>
  `)
})