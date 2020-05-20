import {View} from '../../src/redrunner'
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
    <div watch="color|.applyColor|atts">
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
      <div class="smoothie-list" as="list" watch="..smoothies.change|.smoothieItems|items"></div>
    </div>
  `
  init() {
    this.dom.list.use(SmoothieItem) //.items(smoothies.items)
    /*
    this.dom.fruit.use(Fruit) //.items(fruit.items)
    <div class="fruit-list" as=fruit watch="fruit.change:.fruitItems:items"></div>
    */
  }
  smoothieItems() {
    return smoothies.items
  }
  fruitItems() {
    return fruit.items
  }
}


class SmoothieItem extends View {
  __html__ = `
    <div>
      <h3>{{name}}</h3>
      <a href="{{.link()}}">Edit</a>
    </div>
  `
  link() {
    return '#/smoothies/' + this.props.id
  }
}


export class SmoothieDetail extends View {
  __html__ = `
    <div>
      <button on="click|.toggle">X</button>
      <span>{{name}}</span>
    </div>
  `
  init() {
    this.debug()
  }
  toggle() {
    smoothies.updateSmoothie(this.props.id)
    this.update()
  }
}