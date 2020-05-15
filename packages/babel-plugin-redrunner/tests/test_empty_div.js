class MyView extends View {
  __html__ = '<div/>'
}

//----------------------------------------------------

class MyView extends View {}

MyView.prototype.__bv = function (view, wrap) {
  view.root = wrap(`<div></div>`);
  view.dom = {};
};