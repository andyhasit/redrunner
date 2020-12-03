import {load, View} from '../utils'

const methods = {
  getName: function(p) {
    return p.name
  }  
}

const TestView = View.__ex__({
  html: html`
    <div>{.getName(p)}</div>
  `,
  prototype: methods
})

test("Component uses provided constructor", () => {
  let div = load(TestView, {name: 'A'})
  expect(div).toShow(`
    <div>A</div>
  `)
})
