import {c, h, load, View} from '../utils'


const names = ['joe', 'bob', 'alice']

class TestView extends View {
  __html__ = `
  	<div nest="|.items|">
    </div>
  `
  items() {
  	return names.map(i => h('span', i))
  }
}

const props = {name: 'joe'}

test('Nest without cache declaration adds wrappers', () => {
  // let y = new TestView()
  // y.debug()
  const div = load(TestView, props)

  expect(div).toShow(`
  	<div>
	    <span>joe</span>
	    <span>bob</span>
      <span>alice</span>
    </div>
  `)
})
