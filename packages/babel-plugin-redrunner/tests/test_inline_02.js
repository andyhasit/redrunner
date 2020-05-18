class MyView extends View {
  __html__ = `
    <div>
      <span>{{name | .getName}}</span>
      <span id="hey" class="  my-style {{style}}"></span>
    </div>
  `
}

//----------------------------------------------------

class MyView extends View {}

MyView.prototype.__wq = {
  'this.props.name': function () {
    return this.props.name;
  },
  'this.props.style': function () {
    return this.props.style;
  }
};

MyView.prototype.__wc = {
  'this.props.name': [function (n, o) {
    this.dom.__1.text(this.getName(n, o));
  }],
  'this.props.style': [function (n, o) {
    this.dom.__2.att('class', "my-style " + n);
  }]
};

MyView.prototype.__bv = function (view, wrap) {
  view.root = wrap(`<div><span></span><span id="hey"></span></div>`);
  view.dom = {
    __1: view.__gw([0]),
    __2: view.__gw([1])
  };
};