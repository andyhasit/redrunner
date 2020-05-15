class MyComponent extends Component {
  __html__ = `
    <div>
      <span watch="count::"/>
    </div>
  `
}

//----------------------------------------------------

class MyComponent extends Component {}

MyComponent.prototype._watch_ = {
  'count': [function (n, o) {
    this.dom.__1.text(n);
  }]
};

MyComponent.prototype._build_ = function (m, wrap) {
  m.root = wrap(`<div><span></span></div>`);
  m.dom = {
    __1: m._lu_([0])
  };
};
