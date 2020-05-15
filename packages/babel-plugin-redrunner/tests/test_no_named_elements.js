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

MyComponent.prototype.__bv = function (view, wrap) {
  view.root = wrap(`<div><span>0</span><button class="button">Click me</button></div>`);
  view.dom = {};
};