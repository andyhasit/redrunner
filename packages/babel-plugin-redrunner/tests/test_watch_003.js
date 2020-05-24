class MyView extends View {
  __html__ = `
    <div>
      <span watch="count | .foo |"/>
      <span watch="count | ..foo |"/>
    </div>
  `
}

//----------------------------------------------------

class MyView extends View {}

MyView.prototype.__wq = {
  'count': function () {
    return this.props.count;
  }
};

MyView.prototype.__wc = {
  'count': [function (n, o) {
    this.dom.__1.text(this.foo(n, o));
  }, function (n, o) {
    this.dom.__2.text(foo(n, o));
  }]
};

MyView.prototype.__ht = '<div><span></span><span></span></div>';

MyView.prototype.__bv = function (view, prototype) {
  view.__bd(prototype, false);
  view.dom = {
    __1: view.__gw([0]),
    __2: view.__gw([1])
  };
};
