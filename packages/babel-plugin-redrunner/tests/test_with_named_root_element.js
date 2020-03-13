class MyComponent extends Component {
  __html__ = `
    <div as:main>
    </div>
  `
  foo() {}
}

//----------------------------------------------------

class MyComponent extends Component {
  foo() {}
}

MyComponent.prototype.__build = function (m, wrap) {
  m.root = wrap(`<div></div>`);
  m.dom = {
    main: m.__lookup([])
  };
};