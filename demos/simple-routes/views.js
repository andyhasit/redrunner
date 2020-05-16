import {View} from '../../src/redrunner'
import {todoService} from './todoService'


export class HomePage extends View {
  __html__ = `
    <div class="">
      <a href="#/todos">ToDos</a>
    </div>
  `
}


export class TodoList extends View {
  __html__ = `
    <ul as="list">
        
    </ul>
  `
  init() {
    this.dom.list.use(TodoItem).items(todoService.todos)
  }
}


class TodoItem extends View {
  __html__ = `
    <li>
      <span>&#128512;</span>
      <a as=link></a>
    </li>
  `
  init() {
    this.dom.link
      .att('href', '#/todos/' + this.props.id)
      .text(this.props.text)
  }
}


export class TodoDetail extends View {
  __html__ = `
    <div>
      <button on="click:.toggle:">X</button>
      <span watch="..text::"/>
    </div>
  `
  init() {
    this.debug()
  }
  toggle() {
    this.props.text += '!'
    this.update()
  }
}