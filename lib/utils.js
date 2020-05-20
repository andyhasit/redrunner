"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mount = mount;
exports.wrap = wrap;
exports.h = h;
exports.createView = createView;
exports.Wrapper = exports.ViewCache = exports.isStr = exports.und = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var doc = document;
/**
 * Some utility functions
 */

var und = function und(x) {
  return x === undefined;
};

exports.und = und;

var isStr = function isStr(x) {
  return typeof x === 'string';
};
/**
 * Creates and mounts a view onto an element.
 *
 * @param {unsure} elementOrId Either a string representing an id, or an
 *     element.
 * @param {class} cls The class of View to create
 * @param {object} props The props to pass to the view (optional)
 * @param {object} parent The parent view (optional)
 * @param {int} seq The sequence (optional)
 */


exports.isStr = isStr;

function mount(elementOrId, cls, props, parent, seq) {
  var view = createView(cls, props, parent, seq);
  var target = isStr(elementOrId) ? doc.getElementById(elementOrId.slice(1)) : elementOrId;
  target.parentNode.replaceChild(view.root.e, target);
  return view;
}
/**
 * Creates a wrapper from an HTML string.
 */


function wrap(html) {
  var throwAway = document.createElement('template');
  throwAway.innerHTML = html;
  return new Wrapper(throwAway.content.firstChild);
}
/**
 * Creates a wrapper of type tag and sets inner.
 * TODO: allow class in tag?
 */


function h(tag, inner) {
  return new Wrapper(document.createElement(tag)).inner(inner);
}
/**
 * Creates a view, builds its DOM, and updates it.
 *
 * @param {class} cls The class of View to create
 * @param {object} parent The parent view (optional)
 * @param {object} props The props to pass to the view (optional)
 * @param {int} seq The sequence (optional)
 */


function createView(cls, props, parent, seq) {
  var view = new cls(parent, props, seq);

  view.__bv(view, wrap);

  view.init();
  view.update();
  return view;
}
/**
 * An object which caches and returns views of a same type.
 *
@cls -- any valid subclass of View
@cacheBy -- either:
    <undefined> in which case the sequence is used as key*
    A string used to lookup a property on the item. Can be dotted. e.g. 'user.id'
    A function called with (props, seq) which must return a key
*/


var ViewCache = /*#__PURE__*/function () {
  /**
   * @param {class} cls The class of View to create
   * @param {object} parent The parent view (optional)
   */
  function ViewCache(cls, view, keyFn) {
    _classCallCheck(this, ViewCache);

    var defaultKeyFn = function defaultKeyFn(props, seq) {
      return seq;
    };

    this.view = view;
    this.cls = cls;
    this.cache = {};
    this.keyFn = keyFn || defaultKeyFn;
    this._seq = 0;
  }

  _createClass(ViewCache, [{
    key: "reset",
    value: function reset() {
      this._seq = 0;
    }
  }, {
    key: "get",
    value: function get(props) {
      /*
      Gets a view, potentially from cache
      */
      var view,
          key = this.keyFn(props, this._seq);

      if (this.cache.hasOwnProperty(key)) {
        view = this.cache[key];
      } else {
        view = createView(this.cls, props, this.view, this._seq);
        this.cache[key] = view;
      }

      view.update(props);
      this._seq += 1;
      return view;
    }
  }]);

  return ViewCache;
}();

exports.ViewCache = ViewCache;

var Wrapper = /*#__PURE__*/function () {
  function Wrapper(element, view) {
    _classCallCheck(this, Wrapper);

    this.e = element;
    this._c = undefined; // The viewCache, if any

    this._n = undefined; //  

    this.view = view;
  } // Methods which potentially change the containing view's nested views 


  _createClass(Wrapper, [{
    key: "append",
    value: function append(item) {
      return this._append(item);
    }
  }, {
    key: "_append",
    value: function _append(item) {
      return this.e.appendChild(item.e);
    }
  }, {
    key: "child",
    value: function child(item) {
      this.clear();
      return this._append(item);
    }
  }, {
    key: "replace",
    value: function replace(el) {
      this.e.parentNode.replaceChild(el, this.e);
    }
  }, {
    key: "clear",
    value: function clear() {
      if (this._n) {
        this._n.length = 0;
      }

      this.e.innerHTML = '';
      this.e.textContent = '';
      this.e.value = '';
      return this;
    }
  }, {
    key: "html",
    value: function html(_html) {
      this.e.innerHTML = _html;
      return this;
    }
  }, {
    key: "inner",
    value: function inner(items) {
      /*
       * Use this for adding standard lists of items. Use items() is you used use()
       */
      if (!Array.isArray(items)) {
        return this.child(items);
      }

      this._prepRepeat();

      for (var i = 0, il = items.length; i < il; i++) {
        this._append(items[i]);
      }

      return this._done();
    }
  }, {
    key: "items",
    value: function items(_items) {
      this._prepRepeat();

      var view;

      for (var i = 0, il = _items.length; i < il; i++) {
        view = this._c.get(_items[i]);

        this._nest(view);

        this.e.appendChild(view.root.e);
      }

      return this._done();
    }
  }, {
    key: "_nest",
    value: function _nest(view) {
      //TODO: the idea of this it to keep track of nested views. Check it works...
      if (!this._n) {
        this._n = this.view.__nv;
      }

      this._n.push(view);
    }
  }, {
    key: "_prepRepeat",
    value: function _prepRepeat() {
      this.visible(false);
      this.clear();
    }
  }, {
    key: "_done",
    value: function _done() {
      this.visible(true);
      return this;
    }
  }, {
    key: "use",
    value: function use(cls) {
      this._c = new ViewCache(cls, this);
      return this;
    }
  }, {
    key: "watch",
    value: function watch(desc, callback) {
      var _this = this;

      /*
       *   Watch a value and do something if it has changed.
       * 
       *   This method has two forms.
       * 
       *   If desc does not contain ":" then the callback is simply called if the value 
       *   changes (during the view's update() call)
       *
       *   The callback parameters are (newVal, oldVal, wrapper) 
       *   E.g.
       *
       *      h('div').watch('clickCount', (n,o,w) => w.text(n))
       *
       *   If the desc contains ":" (e.g. "text:clickCount") then we assume what is to 
       *   the left of : to be a method of the wrapper to call if the value has changed.
       *   E.g.
       *
       *       h('div').watch('text:clickCount')  // equates to wrapper.text(newValue)
       *   
       *   In this form, a callback may be provided to transform the value before it is
       *   used. Its parameters are (newVal, oldVal) 
       *   
       *    E.g.
       *
       *       h('div').watch('text:clickCount', (n,o) => `Click count is ${n}`)
       *   
       */
      var path,
          func,
          chunks = desc.split(':');

      if (chunks.length === 1) {
        path = chunks[0];

        func = function func(n, o) {
          return callback(n, o, _this);
        };
      } else {
        var method = chunks[0];
        path = chunks[1];
        func = und(callback) ? function (n) {
          return _this[method](n);
        } : function (n, o) {
          return _this[method](callback(n, o, _this));
        };
      }

      this.view.watch(path, func);
      return this;
    } // These methods are mostly simple DOM wrappers

  }, {
    key: "css",
    value: function css(style) {
      this.e.className = style;
      return this;
    }
  }, {
    key: "cssAdd",
    value: function cssAdd(style) {
      this.e.classList.add(style);
      return this;
    }
  }, {
    key: "cssAddTrans",
    value: function cssAddTrans(style) {
      var _this2 = this;

      return this.transition(function (_) {
        return _this2.e.classList.add(style);
      });
    }
  }, {
    key: "cssRemove",
    value: function cssRemove(style) {
      this.e.classList.remove(style);
      return this;
    }
  }, {
    key: "cssRemoveTrans",
    value: function cssRemoveTrans(style) {
      var _this3 = this;

      return this.transition(function (_) {
        return _this3.e.classList.remove(style);
      });
    }
  }, {
    key: "cssToggle",
    value: function cssToggle(style) {
      this.e.classList.toggle(style);
      return this;
    }
  }, {
    key: "att",
    value: function att(name, value) {
      this.e.setAttribute(name, value);
      return this;
    }
  }, {
    key: "atts",
    value: function atts(_atts) {
      for (var name in _atts) {
        this.att(name, _atts[name]);
      }

      return this;
    }
  }, {
    key: "checked",
    value: function checked(value) {
      this.e.checked = value;
      return this;
    }
  }, {
    key: "href",
    value: function href(value) {
      return this.att('href', value);
    }
  }, {
    key: "id",
    value: function id(value) {
      return this.att('id', value);
    }
  }, {
    key: "src",
    value: function src(value) {
      return this.att('src', value);
    }
  }, {
    key: "value",
    value: function value(_value) {
      return this.att('value', _value);
    }
  }, {
    key: "text",
    value: function text(value) {
      this.e.textContent = value;
      return this;
    }
  }, {
    key: "on",
    value: function on(event, callback) {
      var _this4 = this;

      this.e.addEventListener(event, function (e) {
        return callback(e, _this4);
      });
      return this;
    }
  }, {
    key: "style",
    value: function style(name, value) {
      this.e.style[name] = value;
      return this;
    }
  }, {
    key: "transition",
    value: function transition(fn) {
      var _this5 = this;

      return new Promise(function (resolve) {
        fn();

        var transitionEnded = function transitionEnded(e) {
          _this5.e.removeEventListener('transitionend', transitionEnded);

          resolve();
        };

        _this5.e.addEventListener('transitionend', transitionEnded);
      });
    }
  }, {
    key: "visible",
    value: function visible(_visible) {
      return this.style('visibility', _visible ? 'visible' : 'hidden');
    }
  }, {
    key: "Value",
    get: function get() {
      /* Returns the value of the element */
      return this.e.value;
    }
  }]);

  return Wrapper;
}();

exports.Wrapper = Wrapper;