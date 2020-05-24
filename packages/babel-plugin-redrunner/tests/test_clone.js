class MyView extends View {
  __clone__ = '<div/>'
}

//----------------------------------------------------

class MyView extends View {}

MyView.prototype.__ht = '<div></div>';
MyView.prototype.__cn = undefined;

MyView.prototype.__bv = function (view, prototype) {
  view.__bd(prototype, true);
  view.dom = {};
};
