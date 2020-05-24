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
  'name': function () {
    return this.props.name;
  },
  'style': function () {
    return this.props.style;
  }
};

MyView.prototype.__wc = {
  'name': [function (n, o) {
    this.dom.__1.text(this.getName(n, o));
  }],
  'style': [function (n, o) {
    this.dom.__2.att('class', "my-style " + n);
  }]
};

MyView.prototype.__ht = '<div><span></span><span id="hey"></span></div>';

MyView.prototype.__bv = function (view, prototype) {
  view.__bd(prototype, false);
  view.dom = {
    __1: view.__gw([0]),
    __2: view.__gw([1])
  };
};