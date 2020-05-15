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
  let c1 = m.box(NestedComponent);
  m._rn_([1], c1);
  m.dom = {
    c1: c1
  };
};