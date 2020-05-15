class MyComponent extends Component {
  __html__ = `
    <div>
      <span watch="count::"/>
    </div>
  `
}

//----------------------------------------------------

class MyComponent extends Component {}

MyComponent.prototype._build_ = function (m, wrap) {
  m.root = wrap(`<div><span></span></div>`);
  m.dom = {};
};

MyComponent.prototype._watch_ = {
  'count': [
    function(n, o) {
      this._lu_([0]).text(n)
    }
  ]
};