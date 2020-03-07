import {App, h, Component} from '../../src/redrunner'


class Child extends Component {
  __html__ = `
    <div>
    </div>
  `
  build() {
    this.root = h('div').text(this.o)
  }
  update(newObj) {
    c.log(`updated ${this.o}`)
  }
}


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
      h('button').text('Click me'),
      h('div'),
    ])
    this.dom = {
      'count': this._lookup_([0]),
      'btn': this._lookup_([2]),
      'bits': this._lookup_([3])
    }
    c.log(this.dom)
  }
  init() {
    this.clickCount = 0
    this.dom.btn.on('click', (e) => this.btnClick())
    this.div1 = this.box(Child, 'd1')
    this.div2 = this.box(Child, 'd2')
    this.dom.bits.child(this.div2.root)
  }
  btnClick(e) {
    this.clickCount ++
    let el = this.clickCount % 2 == 1 ? this.div1 : this.div2;
    this.dom.bits.child(el.root)
    this.dom.count.text(`Clicked ${this.clickCount} times`)
    if (this.clickCount > 6) {
      alert("Stop! I'm feeling fragile!!")
    }
    this.update()
  }
}

const app = new App()
app.mount(Main, '#main')
