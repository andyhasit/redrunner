class MyView extends View {
  __html__ = `
    <div>
      <br/>
      <NestedView props="2, 'a'"/>
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
  view.__rn([1], view.nest(NestedView, 2, 'a'));
  view.dom = {};
};