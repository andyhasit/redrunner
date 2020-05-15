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

MyView.prototype.__bv = function (view, wrap) {
  view.root = wrap(`<div><span>0</span><button class="button">Click me</button></div>`);
  view.dom = {};
};