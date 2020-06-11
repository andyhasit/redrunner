import {View} from 'redrunner'
import {fruitService} from '../services/fruit'
import {smoothiesService} from '../services/smoothies'


export class SmoothieListing extends View {
  __html__ = `
    <div>
      <div class="smoothie-list" :items="*|..smoothiesService.items|SmoothieListItem"></div>
    </div>
  `
  init() {
    c.log(smoothiesService.items)
  }
}


class SmoothieListItem extends View {
  __html__ = `
    <div>
      <h2>{{name}}</h2>
      <div class="contents" :items="*|.contents?|Fruit"></div>
      <a class="button" href="{{.link?}}">edit</a>
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


class Fruit extends View {
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