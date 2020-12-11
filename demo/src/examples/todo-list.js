import {View} from 'redrunner'

const todos = []

export const TodoList = View.__ex__(html`
  <div>
    <div>Completed: {stats()}</div>
    <button :onClick=".addItem()">+</button>
    <div :items="todos|TodoItem"></div>
  </div>
`, {
  addItem() {
    todos.push({text: '', done: false})
    this.update()
  },
  taskChanged() {
    this.update()
  }
})

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

const stats = () => {
  const done = todos.filter(t => t.done).length
  return `${done}/${todos.length}`
}
