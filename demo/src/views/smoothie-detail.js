import {View} from 'redrunner'
import {fruitService} from '../services/fruit'
import {smoothiesService} from '../services/smoothies'


export class SmoothieDetail extends View {
  __html__ = `
    <div>
      <button :onClick=".toggle">X</button>
      <span>{{name}}</span>
    </div>
  `
  toggle() {
    smoothiesService.update(this.props.id, {name: 'yo'})
    this.update()
  }
}