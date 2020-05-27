"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CachedWrapper = exports.Wrapper = void 0;

var _helpers = require("./helpers");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function () { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

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
    this._items = []; // For advanced manipulation.
  }
  /**
   * Get element as 'e' form item, else return text node.
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
     * Set inner as individual or array. Not optimised.
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
    /**
     * Set inner items.
     *
     * @param {array} items An array of wrappers or views
     */

  }, {
    key: "items",
    value: function items(_items) {
      var e = this.e;
      e.innerHTML = '';

      for (var i = 0, il = _items.length; i < il; i++) {
        e.appendChild(_items[i].e);
      }

      this._items = _items;
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

var rtnSelf = function rtnSelf(x) {
  return x;
};
/**
 * A wrapper which uses a cache.
 */


var CachedWrapper = /*#__PURE__*/function (_Wrapper) {
  _inherits(CachedWrapper, _Wrapper);

  var _super = _createSuper(CachedWrapper);

  function CachedWrapper(element, cache, config) {
    var _this5;

    _classCallCheck(this, CachedWrapper);

    _this5 = _super.call(this, element);
    _this5.cache = cache;
    _this5.config = config;
    _this5._items = [];
    _this5.oldKeys = [];
    return _this5;
  }

  _createClass(CachedWrapper, [{
    key: "items",
    value: function items(_items2) {
      var e = this.e;
      var cache = this.cache;
      cache.reset();
      var cmp = cache.keyFn || rtnSelf;
      var oldKeys = this.oldKeys;
      var newKeys = [];
      var itemsLength = _items2.length;

      for (var i = 0, il = itemsLength; i < il; i++) {
        var item = _items2[i];
        var key = cmp(_items2[i]); // TODO change to get from cache with key

        newKeys.push(key); // TODO remove this (test first)

        var view = this.cache.getOne(_items2[i]); // view is now updated

        view.seq = i;

        if (i > oldKeys.length - 1) {
          e.appendChild(view.e, this);
          oldKeys.push(key);
        } else if (key !== oldKeys[i]) {
          // This will tear the element out from where it was before
          // Which is OK because it can only be further down
          // (assuming cache isn't shared)
          e.insertBefore(view.e, e.childNodes[i]); // Update the oldKeys to match

          var removeKeyAt = oldKeys.indexOf(key);

          if (removeKeyAt > -1) {
            oldKeys.splice(removeKeyAt, 1);
            oldKeys.splice(i, 0, key);
          }
        }
      }

      var remaining = oldKeys.length - itemsLength + 1;

      if (remaining > 0) {
        while (--remaining) {
          e.removeChild(e.childNodes[itemsLength]);
        }
      }

      this.oldKeys = newKeys; // TODO remove this (test first)

      this._items = _items2;
      return this;
    }
  }]);

  return CachedWrapper;
}(Wrapper);

exports.CachedWrapper = CachedWrapper;