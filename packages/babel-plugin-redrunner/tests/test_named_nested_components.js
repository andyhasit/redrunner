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

MyComponent.prototype._build_ = function (m, wrap) {
  m.root = wrap(`<div><br /><NestedComponent></NestedComponent></div>`);
  let rrr1 = m.box(NestedComponent);
  m._lu_([1]).replace(rrr1.root.e);
  m.dom = {
    c1: rrr1
  };
};