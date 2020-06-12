import {c, h, load, View} from '../utils'

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
  const div = load(TestView, {name: 'tim'})
  expect(data.name).toEqual('tim')
})


class ParentView extends View {
  __html__ = `
    <div>
      <ChildView :props=".child1Props"/>
    </div>
  `
  init() {
    this.child1Props = {name: 'alice'}
    super.init()
  }
}


class ChildView extends View {
  __html__ = `
    <div>
    </div>
  `
  init() {
    data.name = this.props.name
    super.init()
  }
}

test('Nested view init method can access props declared in parent init', () => {
  const div = load(ParentView)
  expect(data.name).toEqual('alice')
})