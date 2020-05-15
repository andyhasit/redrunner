class MyComponent extends Component {
  __html__ = `
    <div>
      <br />
      <NestedComponent />
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
  view.__rn([1], view.nest(NestedComponent));
  view.dom = {};
};