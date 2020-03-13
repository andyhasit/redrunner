class MyComponent extends Component {
  __html__ = `
    <div>
      <span as:count>0</span>
      <div>
        <button as:btn class="button">Click me</button>
      </div>
    </div>
  `
  foo() {}
}

//----------------------------------------------------

class MyComponent extends Component {
  foo() {}
}

MyComponent.prototype.__build = function (m, wrap) {
  m.root = wrap(`<div><span as:count>0</span><div><button as:btn class="button">Click me</button></div></div>`);
  m.dom = {
    count: m.__lookup([0, 0]),
    btn: m.__lookup([0, 1, 0])
  };
};