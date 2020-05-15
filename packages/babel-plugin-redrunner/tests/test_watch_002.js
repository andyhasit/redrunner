class MyComponent extends Component {
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
  __watch__ = {
    count: function(n, o) {
      alert('hi')
    }
  }
}

//----------------------------------------------------

class MyComponent extends Component {}

MyComponent.prototype._watch_ = {
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

MyComponent.prototype._build_ = function (m, wrap) {
  m.root = wrap(`<div><span></span><span></span><span></span><span></span><span></span><span></span></div>`);
  m.dom = {
    __1: m._lu_([0]),
    __2: m._lu_([1]),
    __3: m._lu_([2]),
    __4: m._lu_([3]),
    __5: m._lu_([4]),
    __6: m._lu_([5])
  };
};
