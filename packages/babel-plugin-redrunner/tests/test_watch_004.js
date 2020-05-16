class MyView extends View {
  __html__ = `
    <div>
      <span watch=".count::"/>
      <span watch="..count::"/>
    </div>
  `
}

//----------------------------------------------------

class MyView extends View {}

MyView.prototype.__wc = {
  'this.count': [function (n, o) {
    this.dom.__1.text(n);
  }],
  'this.props.count': [function (n, o) {
    this.dom.__2.text(n);
  }]
};

MyView.prototype.__bv = function (view, wrap) {
  view.root = wrap(`<div><span></span><span></span></div>`);
  view.dom = {
    __1: view.__gw([0]),
    __2: view.__gw([1])
  };
};
