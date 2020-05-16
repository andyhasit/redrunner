class MyView extends View {
  __html__ = `
    <div>
      <br/>
      <NestedView as=c1/>
    </div>
  `
  foo() {}
}

//----------------------------------------------------

class MyView extends View {
  foo() {}
}

MyView.prototype.__bv = function (view, wrap) {
  view.root = wrap(`<div><br /><NestedView></NestedView></div>`);
  let c1 = view.nest(NestedView);
  view.__rn([1], c1);
  view.dom = {
    c1: c1
  };
};