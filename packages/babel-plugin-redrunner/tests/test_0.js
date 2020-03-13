class MyComponent extends Component {
  __html__ = `
    <div>
      <span as="count">0</span>
      <button as="btn" class="button">Click me</button>
    </div>
  `
  foo() {}
}

//----------------------------------------------------

class MyComponent extends Component {
  foo() {}
}
MyComponent.prototype.build = function () {
  let n = h('div');
  n.child(h('span'));
  n.child(h('button'));

};