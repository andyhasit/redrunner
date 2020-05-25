class MyView extends View {
  __html__ = `
    <div>
      <br/>
      <NestedView props="name"/>
      <NestedView props=".name"/>
      <NestedView props="..name"/>
    </div>
  `
  foo() {}
}

//----------------------------------------------------

class MyView extends View {
  foo() {}
}

MyView.prototype.__ht = '<div><br /><NestedView></NestedView><NestedView></NestedView><NestedView></NestedView></div>';

MyView.prototype.__bv = function (view, prototype) {
  view.__bd(prototype, false);
  view.__rn([1], view.nest(NestedView, this.props.name));
  view.__rn([2], view.nest(NestedView, this.name));
  view.__rn([3], view.nest(NestedView, name));
  view.dom = {};
};