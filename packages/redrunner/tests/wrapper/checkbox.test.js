import {load, View} from '../utils'


const TestView = View.__ex__(html`
  <div>
    <input :el="checkbox" type="checkbox">
    <span :el="span">{c.el.checkbox.e.checked}</span>
  </div>
`)

// TODO: figure out how to simulate click/change

// test('isChecked reads correctly', () => {

//   const div = load(TestView)
//   const view = div.view
//   const checkboxElement = view.el.checkbox.e

//   expect(div).toShow(`
//     <div>
//       <input type="checkbox">
//       <span>false</span>
//     </div>
//   `)
//   checkboxElement.change = true
//   //view.update()
//   console.log(checkboxElement.checked)
//   expect(div).toShow(`
//     <div>
//       <input type="checkbox">
//       <span>true</span>
//     </div>
//   `)
// })


const TestView2 = View.__ex__(html`
  <div>
    <input :el="checkbox" type="checkbox" :checked=".done">
    <span :el="span">{c.el.checkbox.isChecked()}</span>
  </div>
`)


test('Checked directive obeys', () => {

  const div = load(TestView2)
  const view = div.view

  expect(div).toShow(`
    <div>
      <input type="checkbox">
      <span>false</span>
    </div>
  `)

  view.done = true
  view.update()
  expect(div).toShow(`
    <div>
      <input type="checkbox">
      <span>true</span>
    </div>
  `)

  view.done = false
  view.update()
  expect(div).toShow(`
    <div>
      <input type="checkbox">
      <span>false</span>
    </div>
  `)
})