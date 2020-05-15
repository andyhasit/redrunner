class MyView extends View {
  __html__ = `
    <div>
      <span watch="count::"/>
      <span watch="count::css"/>
      <span watch="count:foo:"/>
      <span watch="count:foo:css"/>
      <span watch="count:foo"/>
      <span watch="countChanged?: :enabled"/>
    </div>
  `
  ___wc_ = {
    count: function(n, o) {
      alert('hi')
    }
  }
}

//----------------------------------------------------

class MyView extends View {}

MyView.prototype.__wc = {
  'count': [function (n, o) {
    this.dom.__1.text(n);
  }, function (n, o) {
    this.dom.__2.css(n);
  }, function (n, o) {
    this.dom.__3.text(foo(n, o));
  }, function (n, o) {
    this.dom.__4.css(foo(n, o));
  }, function (n, o) {
    foo(n, o, this.dom.__5);
  }],
  'countChanged?': [function (n, o) {
    this.dom.__6.enabled(n);
  }]
};

MyView.prototype.__bv = function (view, wrap) {
  view.root = wrap(`<div><span></span><span></span><span></span><span></span><span></span><span></span></div>`);
  view.dom = {
    __1: view.__gw([0]),
    __2: view.__gw([1]),
    __3: view.__gw([2]),
    __4: view.__gw([3]),
    __5: view.__gw([4]),
    __6: view.__gw([5])
  };
};
