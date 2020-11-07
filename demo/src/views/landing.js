import {View} from 'redrunner'
import {fruitService} from '../services/fruit'


export class LandingPage extends View {
  __html__ = `
    <div class="homepage" style="text-align: center">
      <h1>Smoothie Maker</h1>
      <h3>A RedRunner demo app</h3>
      <hr/>
      <div class="splash-wrapper">
        <span class="homepage-logo" :el="logo"/>
      </div>
      <a class="button" href="#/smoothies">Enter</a>
    </div>
  `
  init() {
    this.fruitIndex = 0
    this.trackMounting()
    this.swapFruit()
  }
  swapFruit() {
    const fruitItems = fruitService.getItems()
    const fruit = fruitItems[this.fruitIndex]
    let el = this.el.logo
    this.fruitIndex = this.fruitIndex < fruitItems.length - 1 ? this.fruitIndex + 1 : 0
    // el.transition(_ => {
    // })
    el.inner(fruit.emoji).style('color', fruit.color)
  }
  mount() {
    c.log('mount')
    this.interval = setInterval(_ => this.swapFruit(), 1600)
  }
  unmount() {
    c.log('unmount')
    clearInterval(this.interval)
  }
}