class MyComponent extends Component {
  __html__ = `
    <div as=main>
    </div>
  `
  foo() {}
}

//----------------------------------------------------

class MyComponent extends Component {
  foo() {}
}

MyComponent.prototype.__bv = function (view, wrap) {
  view.root = wrap(`<div></div>`);
  view.dom = {
    main: view.__gw([])
  };
};