class MyView extends View {
  __html__ = '<div/>'
}

//----------------------------------------------------

class MyView extends View {}

MyView.prototype.__ht = '<div></div>';

MyView.prototype.__bv = function (view, prototype) {
  view.__bd(prototype, false);
  view.dom = {};
};
