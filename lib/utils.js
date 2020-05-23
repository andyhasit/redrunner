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

var c = console;
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
  var nodeToReplace = isStr(elementOrId) ? doc.getElementById(elementOrId.slice(1)) : elementOrId;
  nodeToReplace.parentNode.replaceChild(view.root.e, nodeToReplace);
  return view;
}
/**
 * Creates a wrapper from an HTML string.
 */


function wrap(html) {
  var throwAway = doc.createElement('template');
  throwAway.innerHTML = html;
  return new Wrapper(throwAway.content.firstChild);
}
/**
 * Creates a wrapper of type tag and sets inner.
 * TODO: allow class in tag?
 */


function h(tag, inner) {
  return new Wrapper(doc.createElement(tag)).inner(inner);
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
   * @param {function} keyFn A function which obtains the key to cache by
   */
  function ViewCache(cls, keyFn) {
    _classCallCheck(this, ViewCache);

    var defaultKeyFn = function defaultKeyFn(props, seq) {
      return seq;
    };

    this.cls = cls;
    this.cache = {};
    this.keyFn = keyFn || defaultKeyFn;
    this._seq = 0;
  }

  _createClass(ViewCache, [{
    key: "getMany",
    value: function getMany(items, parentView, reset) {
      var _this = this;

      if (reset) {
        this.reset();
      }

      return items.map(function (props) {
        return _this.getOne(props, parentView);
      });
    }
  }, {
    key: "getOne",
    value: function getOne(props, parentView) {
      /*
      Gets a view, potentially from cache
      */
      var view,
          key = this.keyFn(props, this._seq); // TODO: can I detect whether we use seq?

      if (this.cache.hasOwnProperty(key)) {
        view = this.cache[key];

        if (parentView !== view.parent) {
          view.move(parentView);
        }

        view.update(props);
      } else {
        // Don't use nest
        view = createView(this.cls, props, parentView, this._seq);
        this.cache[key] = view;
      }

      this._seq += 1;
      return view;
    }
  }, {
    key: "reset",
    value: function reset() {
      this._seq = 0;
    }
  }]);

  return ViewCache;
}();
/**
 * A wrapper around a DOM element.
 * All methods (some exceptions) return this, meaning they can be chained.
 */


exports.ViewCache = ViewCache;

var Wrapper = /*#__PURE__*/function () {
  function Wrapper(element) {
    _classCallCheck(this, Wrapper);

    this.e = element;
    this._items = []; // For advanced manipulation.
  }
  /**
   * Converts unknown item into an Element.
   */


  _createClass(Wrapper, [{
    key: "__cu",
    value: function __cu(item) {
      var ct = item.constructor.name;

      if (ct == 'Wrapper') {
        return item.e;
      } else if (ct == 'View') {
        return item.root.e;
      }

      return doc.createTextNode(item);
    }
    /**
     * Gets the element's value. Cannot be chained.
     */

  }, {
    key: "getValue",
    value: function getValue() {
      /* Returns the value of the element */
      return this.e.value;
    }
  }, {
    key: "transition",
    value: function transition(fn) {
      var _this2 = this;

      return new Promise(function (resolve) {
        fn();

        var transitionEnded = function transitionEnded(e) {
          _this2.e.removeEventListener('transitionend', transitionEnded);

          resolve();
        };

        _this2.e.addEventListener('transitionend', transitionEnded);
      });
    }
    /* Every method below must return 'this' so it can be chained */

  }, {
    key: "append",
    value: function append(item) {
      this.e.appendChild(this.__cu(item));

      this._items.push(item);

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
    key: "clear",
    value: function clear() {
      this.e.innerHTML = '';
      this.e.textContent = '';
      this.e.value = '';
      return this;
    }
  }, {
    key: "checked",
    value: function checked(value) {
      this.e.checked = value;
      return this;
    }
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
      var _this3 = this;

      return this.transition(function (_) {
        return _this3.e.classList.add(style);
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
      var _this4 = this;

      return this.transition(function (_) {
        return _this4.e.classList.remove(style);
      });
    }
  }, {
    key: "cssToggle",
    value: function cssToggle(style) {
      this.e.classList.toggle(style);
      return this;
    }
  }, {
    key: "href",
    value: function href(value) {
      return this.att('href', value);
    }
  }, {
    key: "html",
    value: function html(_html) {
      this.e.innerHTML = _html;
      return this;
    }
  }, {
    key: "id",
    value: function id(value) {
      return this.att('id', value);
    }
    /*
     * Add anything, including individual things.
     */

  }, {
    key: "inner",
    value: function inner(items) {
      var _this5 = this;

      if (!Array.isArray(items)) {
        items = [items];
      }

      return this.items(items, function (item) {
        return _this5.__cu(item);
      });
    }
    /**
     * Set element's items.
     *
     * @param {array} items An array of items
     * @param {getEl} items A function which extracts the element from the item
     */

  }, {
    key: "items",
    value: function items(_items, getEl) {
      this.clear();

      for (var i = 0, il = _items.length; i < il; i++) {
        this.e.appendChild(getEl(_items[i]));
      }

      this._items = _items;
      return this;
    }
  }, {
    key: "on",
    value: function on(event, callback) {
      var _this6 = this;

      this.e.addEventListener(event, function (e) {
        return callback(e, _this6);
      });
      return this;
    }
  }, {
    key: "src",
    value: function src(value) {
      return this.att('src', value);
    }
  }, {
    key: "style",
    value: function style(name, value) {
      this.e.style[name] = value;
      return this;
    }
  }, {
    key: "text",
    value: function text(value) {
      this.e.textContent = value;
      return this;
    }
  }, {
    key: "visible",
    value: function visible(_visible) {
      return this.style('visibility', _visible ? 'visible' : 'hidden');
    }
  }, {
    key: "value",
    value: function value(_value) {
      return this.att('value', _value);
    }
    /*
     * Set nested items as views
     */

  }, {
    key: "views",
    value: function views(_views) {
      return this.items(_views, function (view) {
        return view.root.e;
      });
    }
    /*
     * Set nested items as wrappers
     */

  }, {
    key: "wrappers",
    value: function wrappers(_wrappers) {
      return this.items(_wrappers, function (wrapper) {
        return wrapper.e;
      });
    }
  }]);

  return Wrapper;
}();

exports.Wrapper = Wrapper;