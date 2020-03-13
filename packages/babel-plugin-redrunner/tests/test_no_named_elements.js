class MyComponent extends Component {
  __html__ = `
    <div>
      <span>0</span>
      <button class="button">Click me</button>
    </div>
  `
  foo() {}
}

//----------------------------------------------------

class MyComponent extends Component {
  foo() {}
}

MyComponent.prototype.__build = function (m, wrap) {
  m.root = wrap(`<div><span>0</span><button class="button">Click me</button></div>`);
  m.dom = {};
};