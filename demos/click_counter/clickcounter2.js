window.c = console   // So you can debug with c.log()
import {App, View} from 'pillbug-js'


class ClickCounter extends View {
  html = `
    <div>
      <button:btn>click me</button>
      <div:clickCount></div>
    </div>
  `
  load() {

  }
  init(__args__) {
    this.clickCount = 0
    el('btn').on('click', () => this.handleClick())
    watch({
      'clickCount': ['btn:text'],
    })
  }
  handleClick() {
    this.clickCount ++
    this.update()
  }
}


const app = new App()
app.mount(ClickCounter, '#main')
app.update()