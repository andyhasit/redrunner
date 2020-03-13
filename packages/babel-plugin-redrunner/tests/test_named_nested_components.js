class MyComponent extends Component {
  __html__ = `
    <div>
      <br/>
      <NestedComponent as:c1 />
    </div>
  `
  foo() {}
}

//----------------------------------------------------

class MyComponent extends Component {
  foo() {}
}

MyComponent.prototype.__build = function (m, wrap) {
  m.root = wrap(`<div><br/><NestedComponent /></div>`);
  let rrr1 = m.box(NestedComponent);
  m.__lookup([1]).replace(rrr1.root.e);
  m.dom = {
    c1: rrr1
  };
};