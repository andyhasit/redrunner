class MyView extends View {
  __html__ = `
    <div>
      <span :watch="*||"/>
    </div>
  `
}

//----------------------------------------------------

class MyView extends View {}


MyView.prototype.__wc = {
  '*': [function (n, o) {
    this.dom.__1.text(n);
  }]
};

MyView.prototype.__ht = '<div><span></span></div>';

MyView.prototype.__bv = function (view, prototype) {
  view.__bd(prototype, false);
  view.dom = {
    __1: view.__gw([0])
  };
};
