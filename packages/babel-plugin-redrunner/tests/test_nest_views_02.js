class MyView extends View {
  __html__ = `
    <div>
      <span nest="|.items|TodoView:id"/>
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
    this.dom.__1.nest(this.dom.__2.getMany(this.items(n, o), this, true));
  }]
};

MyView.prototype.__bv = function (view, wrap) {
  view.root = wrap(`<div><span></span></div>`);
  view.dom = {
    __2: view.__nc(TodoView, 'id'),
    __1: view.__gw([0])
  };
};
