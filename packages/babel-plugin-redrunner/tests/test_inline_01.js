class MyView extends View {
  __html__ = `
    <div>
      <span>{{name}}</span>
    </div>
  `
}

//----------------------------------------------------

class MyView extends View {}
//<span class="my-class-def {{style}}"></span>
MyView.prototype.__wq = {
  'name': function () {
    return this.props.name;
  }
};

MyView.prototype.__wc = {
  'name': [function (n, o) {
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