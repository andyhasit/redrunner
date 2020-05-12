class MyComponent extends Component {
  __html__ = '<div/>'
}

//----------------------------------------------------

class MyComponent extends Component {}

MyComponent.prototype.__build = function (m, wrap) {
  m.root = wrap(`<div></div>`);
  m.dom = {};
};