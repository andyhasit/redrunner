class Main extends Component {
  __html__ = `
    <div>
      <span:count>0</span>
      <button:btn class="button">Click me</button>
    </div>
  `
  foo() {}
}

//----------------------------------------------------

class Main extends Component {
  build() {
    this.root = h('div').inner([
      h('span').text('0'),
      h('button').text('Click me')
    ])
    this.dom = {
      'count': this._lookup_([0]),
      'btn': this._lookup_([2]),
    }
  }
  foo() {}
}