import {c, h, load, View} from '../utils'


const caps = (n, o) => n.toUpperCase()
const person = {name: 'Hortense'}

class ParentView extends View {
  __html__ = `
    <div>
      <div>{{name}}</div>
      <div>{{.getHeight?}}</div>
    </div>
  `
  getHeight() {
    return 175
  }
}

class ChildView1 extends ParentView {
  getHeight() {
    return 200
  }
}

class ChildView2 extends ParentView {
  __html__ = `
    <div>
      <div>{{name | ..caps?}}</div>
      <div>{{.getHeight?}}</div>
    </div>
  `
}

test("ChildView1 uses parent's generated code", () => {
  const div = load(ChildView1, person)
  expect(div).toShow(`
    <div>
      <div>Hortense</div>
      <div>200</div>
    </div>
  `)
})

test("ChildView2 uses own generated code, but inherits method", () => {
  const div = load(ChildView2, person)
  expect(div).toShow(`
    <div>
      <div>HORTENSE</div>
      <div>175</div>
    </div>
  `)
})