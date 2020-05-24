class MyView extends View {
  __html__ = `
    <div>
      <span nest="|.items|"/>
      <span nest="|.items?|"/>
      <span nest="|.items()|"/>
    </div>
  `
}

//----------------------------------------------------

class MyView extends View {}

MyView.prototype.__wq = {
  '': function () {
    return true;
  }
};

MyView.prototype.__wc = {
  '': [function (n, o) {
    this.dom.__1.wrappers(this.items);
  }, function (n, o) {
    this.dom.__2.wrappers(this.items(n, o));
  }, function (n, o) {
    this.dom.__3.wrappers(this.items());
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
