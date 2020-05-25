class MyView extends View {
  __html__ = `
    <div>
      <span watch="count||"/>
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
