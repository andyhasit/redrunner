import {View} from 'redrunner'
import {fruitService} from '../services/fruit'
import {smoothiesService} from '../services/smoothies'

class Page extends View {
  __html__ = `
    <div class="page">
      <h3>{{.getTitle?}}</h3>
      <stub:content>
      <hr>
    </div>
  `
  getTitle() {
    return 'A page'
  }
}

export class SmoothieDetail extends Page {
  __stubs__ = {
    content: `
      <div>
        <button :onClick=".toggle">X</button>
        <span>{{name}}</span>
      </div>
    `
  }
  toggle() {
    smoothiesService.update(this.props.id, {name: 'yo'})
    this.update()
  }
  getTitle() {
    return this.props.name
  }
}