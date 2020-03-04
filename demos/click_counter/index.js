import {App, h, Component} from '../../src/redrunner'


class Main extends Component {
  __html__ = `
    <div>
      <span>0</span>                       <<< count
      <a class="button">Click me</a>       <<< btn
    </div>
  `
  build() {
    /*
    This method builds the DOM and saves references to named elements.
    Will be generated from __html__
    */
    this.root = h('div').inner([
      h('span').text('unclicked'),
      h('br'),
      h('button').text('Click me')
    ])
    this.dom = {
      'count': this._lookup_([0]),
      'btn': this._lookup_([2])
    }
  }
  init() {

    this.clickCount = 0
    this.dom.btn.on('click', (e) => this.btnClick())
  }
  btnClick(e) {
    this.clickCount ++
    this.dom.count.text(`Clicked ${this.clickCount} times`)
  }
}

const app = new App()
app.mount(Main, '#main')
