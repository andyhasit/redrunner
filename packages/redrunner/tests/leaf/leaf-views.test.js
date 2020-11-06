import {load, View} from '../utils'

const MyView = View.leaf({
  __html__: `
    <div>
      <div>{{title}}</div>
    </div>
  `
})

test("Can create simple view", () => {
  const div = load(MyView, {title: 'Confirm'})
  expect(div).toShow(`
    <div>
      <div>Confirm</div>
    </div>
  `)
})