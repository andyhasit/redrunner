class MyView extends View {
  __html__ = `
    <div>
      <span watch="count||"/>
      <span watch="count||css"/>
      <span watch="count|foo|"/>
      <span watch="count|.foo|css"/>
      <span watch="count|..foo"/>
      <span watch="countChanged()||enabled"/>
    </div>
  `
}

//----------------------------------------------------

class MyView extends View {}

MyView.prototype.__wq = {
  'count': function () {
    return this.props.count;
  },
  'countChanged()': function () {
    return this.props.countChanged();
  }
};

MyView.prototype.__wc = {
  'count': [function (n, o) {
    this.dom.__1.text(n);
  }, function (n, o) {
    this.dom.__2.css(n);
  }, function (n, o) {
    this.dom.__3.text(this.props.foo(n, o));
  }, function (n, o) {
    this.dom.__4.css(this.foo(n, o));
  }, function (n, o) {
    foo(n, o, this.dom.__5);
  }],
  'countChanged()': [function (n, o) {
    this.dom.__6.enabled(n);
  }]
};

MyView.prototype.__ht = '<div><span></span><span></span><span></span><span></span><span></span><span></span></div>';

MyView.prototype.__bv = function (view, prototype) {
  view.__bd(prototype, false);
  view.dom = {
    __1: view.__gw([0]),
    __2: view.__gw([1]),
    __3: view.__gw([2]),
    __4: view.__gw([3]),
    __5: view.__gw([4]),
    __6: view.__gw([5])
  };
};
