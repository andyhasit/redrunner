class MyView extends View {
  __html__ = `
    <div>
      <span as=count>0</span>
      <div>
        <div>
          <button as=btn class="button">Click me</button>
        </div>
      </div>
    </div>
  `
  foo() {}
}

//----------------------------------------------------

class MyView extends View {
  foo() {}
}

MyView.prototype.__ht = '<div><span>0</span><div><div><button class="button">Click me</button></div></div></div>';

MyView.prototype.__bv = function (view, prototype) {
  view.__bd(prototype, false);
  view.dom = {
    count: view.__gw([0]),
    btn: view.__gw([1, 0, 0])
  };
};