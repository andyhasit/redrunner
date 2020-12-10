import {c, load, View} from '../utils'


class TestView extends View {
  __html__ = `
    <div>
      <span :watch="..height||@height"></span>
      <span :watch="..color||style:color"></span>
    </div>
  `
}

const props = {
  height: '100px',
  color: 'green'
}

test('Basic watch updates text', () => {
  const div = load(TestView, props)
  expect(div).toShow(`
    <div>
      <span height="100px"></span>
      <span style="color: green;"></span>
    </div>
  `)
})
