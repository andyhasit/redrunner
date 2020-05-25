class MyView extends View {
  __html__ = `
    <div>
      <span>0</span>
      <button class="button">Click me</button>
    </div>
  `
  foo() {}
}

//----------------------------------------------------

class MyView extends View {
  foo() {}
}

MyView.prototype.__ht = '<div><span>0</span><button class="button">Click me</button></div>';

MyView.prototype.__bv = function (view, prototype) {
  view.__bd(prototype, false);
  view.dom = {};
};