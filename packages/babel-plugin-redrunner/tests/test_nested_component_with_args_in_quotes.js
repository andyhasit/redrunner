class MyComponent extends Component {
  __html__ = `
    <div>
      <br/>
      <NestedComponent args="2, 'a'"/>
    </div>
  `
  foo() {}
}

//----------------------------------------------------

class MyComponent extends Component {
  foo() {}
}

MyComponent.prototype.__build = function (m, wrap) {
  m.root = wrap(`<div><br /><NestedComponent></NestedComponent></div>`);
  m.__lookup([1]).replace(m.box(NestedComponent, 2, 'a').root.e);
  m.dom = {};
};