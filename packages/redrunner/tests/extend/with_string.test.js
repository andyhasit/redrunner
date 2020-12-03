import {load, View} from '../utils'

const TestView = View.__ex__(html`
  <div>{..name}</div>
`)

test("Creates component definition", () => {
  let div = load(TestView, {name: 'A'})
  expect(div).toShow(`
    <div>A</div>
  `)
})
