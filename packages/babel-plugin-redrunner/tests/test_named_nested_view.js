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

MyView.prototype.__ht = '<div><br /><NestedView></NestedView></div>';

MyView.prototype.__bv = function (view, prototype) {
  view.__bd(prototype, false);
  let c1 = view.nest(NestedView);
  view.__rn([1], c1);
  view.dom = {
    c1: c1
  };
};