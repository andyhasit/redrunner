import {c, load, View} from '../utils'


class TestView extends View {
  __html__ = `
  	<div>
    	<span>{{name}}</span>
      <span>{{.name}}</span>
      <span>{{..service.name}}</span>
    </div>
  `
  init() {
  	this.name = 'joe'
  }
}

const props = {name: 'bob'}
const service = {name: 'jane'}

test('Inner display correct initial values', () => {
  const div = load(TestView, props)
  expect(div).toShow(`
  	<div>
	    <span>bob</span>
	    <span>joe</span>
      <span>jane</span>
    </div>
  `)
})

test('Inner update when service changed', () => {
  const div = load(TestView, props)
  service.name = 'dave'
  div.update()
  expect(div).toShow(`
    <div>
      <span>bob</span>
      <span>joe</span>
      <span>dave</span>
    </div>
  `)
})

test('Inner update when props changed', () => {
  const div = load(TestView, props)
  props.name = 'boris'
  div.update()
  expect(div).toShow(`
    <div>
      <span>boris</span>
      <span>joe</span>
      <span>dave</span>
    </div>
  `)
})

test('Inner update when new props passed', () => {
  const div = load(TestView, props)
  div.setProps({name: 'alice'})
  expect(div).toShow(`
    <div>
      <span>alice</span>
      <span>joe</span>
      <span>dave</span>
    </div>
  `)
})