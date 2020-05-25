import {View} from 'redrunner'
import {fruit} from './fruit'
import {smoothies} from './smoothies'


export class HomePage extends View {
  __html__ = `
    <div style="text-align: center">
      <span class="homepage-logo">&#x1f984;</span>
      <br/>
      <a href="#/smoothies">My Smoothiez</a>
    </div>
  `
}

export class Fruit extends View {
  __html__ = `
    <div watch="color|.applyColor?|atts">
      <span watch="emoji||"/>
      <span watch="name||"/>
    </div>
  `
  applyColor(n) {
    return {'style': `color: ${n}`}
  }
}

export class SmoothieList extends View {
  __html__ = `
    <div>
      <div class="smoothie-list" as="list" nest="|..smoothies.items|SmoothieItem"></div>
    </div>
  `
}


class SmoothieItem extends View {
  __html__ = `
    <div>
      <h3>{{name}}</h3>
      <a href="{{.link?}}">Edit</a>
    </div>
  `
  link() {
    return '#/smoothies/' + this.props.id
  }
}

function toggle() {
  alert('wooo hiiii')
}

export class SmoothieDetail extends View {
  __html__ = `
    <div>
      <button on="click|.toggle?">X</button>
      <span>{{name}}</span>
    </div>
  `
  init() {
    this.debug()//
  }
  toggle() {
    smoothies.update(this.props.id, {name: 'yo'})
    this.update()
  }
}