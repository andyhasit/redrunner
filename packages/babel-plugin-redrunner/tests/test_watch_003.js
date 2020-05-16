class MyView extends View {
  __html__ = `
    <div>
      <span watch="count: .foo :"/>
      <span watch="count: ..foo :"/>
    </div>
  `
}

//----------------------------------------------------

class MyView extends View {}

MyView.prototype.__wc = {
  'count': [function (n, o) {
    this.dom.__1.text(this.foo(n, o));
  }, function (n, o) {
    this.dom.__2.text(this.props.foo(n, o));
  }]
};

MyView.prototype.__bv = function (view, wrap) {
  view.root = wrap(`<div><span></span><span></span></div>`);
  view.dom = {
    __1: view.__gw([0]),
    __2: view.__gw([1])
  };
};
