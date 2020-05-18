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
  'this.props.name': function () {
    return this.props.name;
  }
};

MyView.prototype.__wc = {
  'this.props.name': [function (n, o) {
    this.dom.__1.text(n);
  }]
};

MyView.prototype.__bv = function (view, wrap) {
  view.root = wrap(`<div><span></span></div>`);
  view.dom = {
    __1: view.__gw([0])
  };
};