class MyComponent extends Component {
  __html__ = '<div/>'
}

//----------------------------------------------------

class MyComponent extends Component {}

MyComponent.prototype.__bv = function (view, wrap) {
  view.root = wrap(`<div></div>`);
  view.dom = {};
};