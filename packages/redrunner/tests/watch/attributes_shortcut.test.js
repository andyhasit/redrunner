import {c, load, View} from '../utils'


class TestView extends View {
  __html__ = `
    <div>
      <span :watch="..personHeight||@height"></span>
    </div>
  `
}

const props = {personHeight: '100px'}

test('Basic watch updates text', () => {
  const div = load(TestView, props)
  expect(div).toShow(`
    <div>
      <span height="100px"></span>
    </div>
  `)
})
