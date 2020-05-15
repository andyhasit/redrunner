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

MyComponent.prototype._build_ = function (m, wrap) {
  m.root = wrap(`<div><br /><NestedComponent></NestedComponent></div>`);
  m._rn_([1], m.box(NestedComponent, 2, 'a'));
  m.dom = {};
};