class MyComponent extends Component {
  __html__ = `
    <div>
      <br/>
      <NestedComponent as=c1/>
    </div>
  `
  foo() {}
}

//----------------------------------------------------

class MyComponent extends Component {
  foo() {}
}

MyComponent.prototype.__bv = function (view, wrap) {
  view.root = wrap(`<div><br /><NestedComponent></NestedComponent></div>`);
  let c1 = view.nest(NestedComponent);
  view.__rn([1], c1);
  view.dom = {
    c1: c1
  };
};