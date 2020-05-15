class MyView extends View {
  __html__ = `
    <div as=main>
    </div>
  `
  foo() {}
}

//----------------------------------------------------

class MyView extends View {
  foo() {}
}

MyView.prototype.__bv = function (view, wrap) {
  view.root = wrap(`<div></div>`);
  view.dom = {
    main: view.__gw([])
  };
};