class MyView extends View {
  __html__ = `
    <div>
      <span on="click| foo"/>
      <span on="click| .foo"/>
      <span on="click| ..foo"/>
    </div>
  `
}

//----------------------------------------------------

class MyView extends View {}

MyView.prototype.__ht = '<div><span></span><span></span><span></span></div>';

MyView.prototype.__bv = function (view, prototype) {
  view.__bd(prototype, false);
  view.dom = {
    __1: view.__gw([0]).on('click', (e, w) => this.props.foo(e, w)),
    __2: view.__gw([1]).on('click', (e, w) => this.foo(e, w)),
    __3: view.__gw([2]).on('click', (e, w) => foo(e, w))
  };
};
