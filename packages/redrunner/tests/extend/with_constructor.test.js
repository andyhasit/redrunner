import {load, View} from '../utils'


const TestView = View.__ex__({
  html: html`
    <div>{.foo}</div>
  `,
  constructor: function(parent) {
    this.foo = 'A'
    View.apply(this, parent)
  }  
})

test("Component uses provided constructor", () => {
  let div = load(TestView)
  expect(div).toShow(`
    <div>A</div>
  `)
})
