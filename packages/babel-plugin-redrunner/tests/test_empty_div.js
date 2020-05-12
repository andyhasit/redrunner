class MyComponent extends Component {
  __html__ = '<div/>'
}

//----------------------------------------------------

class MyComponent extends Component {}

MyComponent.prototype._build_ = function (m, wrap) {
  m.root = wrap(`<div></div>`);
  m.dom = {};
};