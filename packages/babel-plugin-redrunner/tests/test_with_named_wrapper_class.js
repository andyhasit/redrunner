class MyView extends View {
  __html__ = `
    <div as="main" cls="SpecialWrapper">
    </div>
  `
  foo() {}
}

//----------------------------------------------------

class MyView extends View {
  foo() {}
}

MyView.prototype.__ht = '<div></div>';

MyView.prototype.__bv = function (view, prototype) {
  view.__bd(prototype, false);
  view.dom = {
    main: new SpecialWrapper(view.__lu([]))
  };
};