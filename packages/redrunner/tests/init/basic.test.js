import {load, View} from '../utils'

const data = {}

class TestView extends View {
  __html__ = `
    <div>
    </div>
  `
  init() {
    data.name = this.props.name
  }
}

test('Init method can access props', () => {
  load(TestView, {name: 'tim'})
  expect(data.name).toEqual('tim')
})
