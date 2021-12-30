import {View} from 'redrunner'

export class TodoList extends View{
  __html__ = html`
  <div>
    <div>Completed: {stats(c)}</div>
    <div>Meh: {c.todos.length * 2|prettyFormat(n, p)}</div>
    <button :onClick=".addItem()">+</button>
    <div :items="c.todos|TodoItem"></div>
  </div>
  `
  todos = []
  addItem() {
    this.todos.push({text: '', done: false})
    this.update()
  }
  taskChanged() {
    this.update()
  }
}
const prettyFormat = (n, p) => {console.log(p)}
const TodoItem = View.__ex__(html`
  <div>
    <input type="checkbox" :checked="..done" :onChange="toggleTask(w, p, c)"/>
    <input type="text" :onBlur="textChanged(w, p, c)" value="{..text}"/>
  </div>
`)

const textChanged = (w, p, c) => {
  p.text = w.getValue()
  c.bubble('taskChanged')
}

const toggleTask = (w, p, c) => {
  p.done = w.getAtt('checked')
  c.bubble('taskChanged')
}

const stats = (c) => {
  const done = c.todos.filter(t => t.done).length
  return `${done}/${c.todos.length}`
}
