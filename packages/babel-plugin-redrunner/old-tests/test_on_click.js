class MyView extends View {
  __html__ = `
    <div>
      <span :on="click|foo"></span>
      <span :on="click|.foo"></span>
      <span :on="click|..foo?"></span>
      <span :on="click|..foo(2)"></span>
    </div>
  `
}

//----------------------------------------------------

class MyView extends View {}

MyView.prototype.__ht = '<div><span></span><span></span><span></span><span></span></div>';

MyView.prototype.__bv = function (view, prototype) {
  view.__bd(prototype, false);
  view.dom = {
    __1: view.__gw([0]).on('click', function (w, e) {
      view.props.foo(w, e);
    }),
    __2: view.__gw([1]).on('click', function (w, e) {
      view.foo(w, e);
    }),
    __3: view.__gw([2]).on('click', function (w, e) {
      foo(w, e);
    }),
    __4: view.__gw([3]).on('click', function (w, e) {
      foo(2);
    })
  };
};