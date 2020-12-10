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


const TestView2 = View.__ex__(html`
  <div>{.name}</div>
`, {init: function(){
  this.name = 'B'
}})



test("Definition include prototype", () => {
  let div = load(TestView2)
  expect(div).toShow(`
    <div>B</div>
  `)
})