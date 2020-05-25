class MyView extends View {
  __html__ = `
    <div>
      <span watch="countChanged?||enabled"/>
      <span watch="count|foo"/>
      <span watch="count|foo?"/>
      <span watch="count|foo()"/>
    </div>
  `
}

//----------------------------------------------------

class MyView extends View {}

MyView.prototype.__wq = {
  'countChanged?': function () {
    return this.props.countChanged();
  },
  'count': function () {
    return this.props.count;
  }
};

MyView.prototype.__wc = {
  'countChanged?': [function (n, o) {
    this.dom.__1.enabled(n);
  }],
  'count': [function (n, o) {
    this.props.foo(n, o, this.dom.__2);
  }, function (n, o) {
    this.props.foo(n, o, this.dom.__3);
  }, function (n, o) {
    this.props.foo();
  }]
};

MyView.prototype.__ht = '<div><span></span><span></span><span></span><span></span></div>';

MyView.prototype.__bv = function (view, prototype) {
  view.__bd(prototype, false);
  view.dom = {
    __1: view.__gw([0]),
    __2: view.__gw([1]),
    __3: view.__gw([2]),
    __4: view.__gw([3])
  };
};
