import {c, load, View} from '../utils'


const props = {
  getName: function() {
    return 'bob'
  }
}

function getName() {
  return 'joe'
}

const service = {
  name: 'jane',
  getName: function() {
    return this.name
  }
}


class TestView extends View {
  __html__ = `
  	<div>
    	<span>{{getName()}}</span>
      <span>{{.getName()}}</span>
      <span>{{..getName()}}</span>
      <span>{{..service.getName()}}</span>
    </div>
  `
  geName() {
  	return 'lisa'
  }
}



test('Inline functions called correctly', () => {
  const div = load(TestView, props)
  expect(div).toShow(`
  	<div>
	    <span>bob</span>
	    <span>lisa</span>
      <span>joe</span>
      <span>jane</span>
    </div>
  `)
})