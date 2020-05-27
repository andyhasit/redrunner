import {c, h, load, View} from '../utils'

const names = ['joe', 'bob', 'alice']

class TestView extends View {
  __html__ = `
  	<div :nest="|..names|PersonView">
    </div>
  `
}

class PersonView extends View {
  __html__ = `
    <span>{{.props}}</span>
  `
}


test('Nest with class', () => {
  const div = load(TestView)

  expect(div).toShow(`
  	<div>
	    <span>joe</span>
	    <span>bob</span>
      <span>alice</span>
    </div>
  `)
})
