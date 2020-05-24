class MyView extends View {
  __html__ = `
    <div>
      <span>{{name|.getName}}</span>
      <span>{{name|.getName?}}</span>
      <span>{{name|.getName()}}</span>
    </div>
  `
}

//----------------------------------------------------

class MyView extends View {}

MyView.prototype.__wq = {
  'name': function () {
    return this.props.name;
  }
};

MyView.prototype.__wc = {
  'name': [function (n, o) {
    this.dom.__1.text(this.getName);
  }, function (n, o) {
    this.dom.__2.text(this.getName(n, o));
  }, function (n, o) {
    this.dom.__3.text(this.getName());
  }]
};

MyView.prototype.__ht = '<div><span></span><span></span><span></span></div>';

MyView.prototype.__bv = function (view, prototype) {
  view.__bd(prototype, false);
  view.dom = {
    __1: view.__gw([0]),
    __2: view.__gw([1]),
    __3: view.__gw([2])
  };
};