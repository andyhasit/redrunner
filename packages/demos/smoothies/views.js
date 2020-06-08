import {View} from 'redrunner'
import {fruitService} from './services/fruit'
import {smoothiesService} from './services/smoothies'

class Mountie {
  constructor() {
    this.trackedViews = []
  }
  track(view) {
    this.trackedViews.push({view: view, isAttached: view.__ia()})
  }
  flush() {
    const trackedViews = this.trackedViews
    for (let i=0, il=trackedViews.length; i<il; i++) {
      let trackedView = trackedViews[i]
      let view = trackedView.view
      let isAttached = view.__ia()
      if (isAttached !== trackedView.isAttached) {
        let fn = isAttached ? view.mount : view.unmount
        fn.apply(view)
        trackedView[isAttached] = isAttached
      }
    }
  }
}
const mountie = new Mountie()

export class HomePage extends View {
  __html__ = `
    <div style="text-align: center">
      <span class="homepage-logo" :as="logo"/>
      <br/>
      <a href="#/smoothies">Enter</a>
    </div>
  `
  init() {
    const fruitItems = fruitService.getItems()
    mountie.track(this)
  }
  swapFruit() {
    let fruit = fruitItems[Math.floor(Math.random() * fruitItems.length)]
    c.log(fruit)
    this.dom.logo.inner(fruit.emoji).style('color', fruit.color)
  }
  mount() {
    c.log('m')
    //this.interval = setInterval(this.swapFruit, 900)
  }
  unmount() {
    c.log('u')
    //clearInterval(interval)
  }
}

export class Fruit extends View {
  __html__ = `
    <div class="fruit" :watch="color|.applyColor?|atts">
      <span class="emoji">{{emoji}}</span>
      <span>&nbsp;x&nbsp;</span>
      <span>{{qty}}</span>
    </div>
  `
  applyColor(n) {
    return {'style': `color: ${n}`}
  }
}

export class SmoothieList extends View {
  __html__ = `
    <div>
      <div class="smoothie-list" :items="*|..smoothiesService.items|SmoothieListItem"></div>
    </div>
  `
}

class SmoothieListItem extends View {
  __html__ = `
    <div>
      <a href="{{.link?}}"><h3>{{name}}</h3></a>
      <div class="contents" :items="*|.contents?|Fruit"></div>
    </div>
  `
  contents() {
    const contents = []
    for (let [id, qty] of Object.entries(this.props.contents)) {
      let fruit = fruitService.get(id)
      contents.push({color: fruit.color, emoji: fruit.emoji, qty: qty})
    }
    return contents
  }
  link() {
    return '#/smoothies/' + this.props.id
  }
}


export class SmoothieDetail extends View {
  __html__ = `
    <div>
      <button :on="click|.toggle?">X</button>
      <span>{{name}}</span>
    </div>
  `
  toggle() {
    smoothiesService.update(this.props.id, {name: 'yo'})
    this.update()
  }
}