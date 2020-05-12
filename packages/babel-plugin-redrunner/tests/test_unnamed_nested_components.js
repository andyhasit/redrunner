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

MyComponent.prototype._build_ = function (m, wrap) {
  m.root = wrap(`<div><br /><NestedComponent></NestedComponent></div>`);
  m._lu_([1]).replace(m.box(NestedComponent).root.e);
  m.dom = {};
};