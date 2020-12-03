
import {load, View} from '../utils'




//const MyView = View.__ex__(html, stubs, prototype, constructor)

const TestView = View.__ex__(html`<div>{..name}</div>`)



test("Extend method creates component definition", () => {
  let div = load(MyView, {name: 'A'})
  expect(div).toShow(`
    <div>A</div>
  `)
})
