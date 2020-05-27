class MyView extends View {
  __html__ = `
    <div>
      <div :nest="|.items?|TodoView"/>
      <div :nest="|.items?|TodoView:name"/>
      <div :nest="|.items?|TodoView:id"/>
      <div :nest="|.items?|@..myCache"/>
      <div :nest="|.items?|@..myCache|.myConfig"/>
      <div :nest="|.items?|TodoView:.getKey?"/>
    </div>
  `
}

//----------------------------------------------------

class MyView extends View {}

MyView.prototype.__wq = {
  '': function () {
    return true;
  }
};

MyView.prototype.__wc = {
  '': [function (n, o) {
    this.dom.__1.items(this.items(n, o));
  }, function (n, o) {
    this.dom.__2.items(this.items(n, o));
  }, function (n, o) {
    this.dom.__3.items(this.items(n, o));
  }, function (n, o) {
    this.dom.__4.items(this.items(n, o));
  }, function (n, o) {
    this.dom.__5.items(this.items(n, o));
  }, function (n, o) {
    this.dom.__6.items(this.items(n, o));
  }]
};

MyView.prototype.__ht = '<div><div></div><div></div><div></div><div></div><div></div><div></div></div>';

MyView.prototype.__bv = function (view, prototype) {
  view.__bd(prototype, false);
  view.dom = {
    __1: view.__cw([0], view.__sc(TodoView), {}),
    __2: view.__cw([1], view.__kc(TodoView, function (props) {
      return props.name;
    }), {}),
    __3: view.__cw([2], view.__kc(TodoView, function (props) {
      return props.id;
    }), {}),
    __4: view.__cw([3], myCache, {}),
    __5: view.__cw([4], myCache, this.myConfig),
    __6: view.__cw([5], view.__kc(TodoView, this.getKey), {})
  };
};
