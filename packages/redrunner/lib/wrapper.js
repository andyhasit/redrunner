"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Wrapper = void 0;

var _helpers = require("./helpers");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * A wrapper around a DOM element.
 * All transformative methods return this (except transitions as they return promises)
 * This means those methods can be chained.
 */
var Wrapper = /*#__PURE__*/function () {
  function Wrapper(element) {
    _classCallCheck(this, Wrapper);

    this.e = element;
    this._keys = undefined;
    this._cache = undefined;
  }
  /**
   * Get element as 'e' from item, else return text node.
   */


  _createClass(Wrapper, [{
    key: "__ge",
    value: function __ge(item) {
      return item.e || _helpers.doc.createTextNode(item);
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
      var _this = this;

      return new Promise(function (resolve) {
        fn();

        var transitionEnded = function transitionEnded(e) {
          _this.e.removeEventListener('transitionend', transitionEnded);

          resolve();
        };

        _this.e.addEventListener('transitionend', transitionEnded);
      });
    }
    /* Every method below must return 'this' so it can be chained */

  }, {
    key: "append",
    value: function append(item) {
      this.e.appendChild(this.__ge(item));
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
    key: "cache",
    value: function cache(_cache) {
      this._cache = _cache;
      this._keys = [];
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
    key: "child",
    value: function child(wrapper) {
      this.e.innerHTML = '';
      this.e.appendChild(wrapper.e);
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
     * Set inner as individual item or array. Not optimised.
     */

  }, {
    key: "inner",
    value: function inner(items) {
      if (!Array.isArray(items)) {
        items = [items];
      }

      var e = this.e;
      e.innerHTML = '';

      for (var i = 0, il = items.length; i < il; i++) {
        e.appendChild(this.__ge(items[i]));
      }

      return this;
    }
    /*
     * Set items from cache.
     */

  }, {
    key: "items",
    value: function items(_items) {
      var e = this.e;
      var childNodes = e.childNodes;
      var cache = this._cache;
      var oldKeys = this._keys;
      var newKeys = [];
      var itemsLength = _items.length;
      var canAddNow = oldKeys.length - 1;
      cache.reset();
      var start = performance.now();
      /*
       * We loop over the newKeys and pull Elements forward.
       * oldKeys will be edited in place to look like newKeys, but may have trailing
       * keys which represent the items to be removed.
       */

      for (var i = 0; i < itemsLength; i++) {
        var item = _items[i];

        var _this$_cache$getOne = this._cache.getOne(item),
            view = _this$_cache$getOne.view,
            key = _this$_cache$getOne.key;

        newKeys.push(key);

        if (i > canAddNow) {
          e.appendChild(view.e, this);
        } else if (key !== oldKeys[i]) {
          /*
           * Note: insertBefore removes the element from the DOM if attached
           * elsewhere, which should either only be further down in the
           * childNodes, or in case of a shared cache, somewhere we don't
           * care about removing it from, so its OK.
           */
          e.insertBefore(view.e, childNodes[i]);
        }
      }

      var lastIndex = childNodes.length - 1;
      var keepIndex = itemsLength - 1;

      for (var _i = lastIndex; _i > keepIndex; _i--) {
        e.removeChild(childNodes[_i]);
      }

      this._keys = newKeys;
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
    key: "replace",
    value: function replace(el) {
      this.e.parentNode.replaceChild(el, this.e);
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
  }]);

  return Wrapper;
}();

exports.Wrapper = Wrapper;