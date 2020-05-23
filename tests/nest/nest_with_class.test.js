import {c, h, load, View} from '../utils'


const names = ['joe', 'bob', 'alice']

class TestView extends View {
  __html__ = `
  	<div nest="|.items|PersonView">
    </div>
  `
  items() {
  	return names
  }
}

class PersonView extends View {
  __html__ = `
    <span>{{.props}}</span>
  `
}


test('Nest without cache declaration adds wrappers', () => {
  const div = load(TestView)

  expect(div).toShow(`
  	<div>
	    <span>joe</span>
	    <span>bob</span>
      <span>alice</span>
    </div>
  `)
})
