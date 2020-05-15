class MyComponent extends Component {
  __html__ = `
    <div>
      <span watch="count::"/>
    </div>
  `
}

//----------------------------------------------------

class MyComponent extends Component {}

MyComponent.prototype.__wc = {
  'count': [function (n, o) {
    this.dom.__1.text(n);
  }]
};

MyComponent.prototype.__bv = function (view, wrap) {
  view.root = wrap(`<div><span></span></div>`);
  view.dom = {
    __1: view.__gw([0])
  };
};
