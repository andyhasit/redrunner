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

      return _helpers.doc.createTextNode(item);
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
     * Add anything, including individual things.
     */

  }, {
    key: "inner",
    value: function inner(items) {
      var _this4 = this;

      if (!Array.isArray(items)) {
        items = [items];
      }

      return this.items(items, function (item) {
        return _this4.__cu(item);
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
      var e = this.e;
      e.innerHTML = '';

      for (var i = 0, il = _items.length; i < il; i++) {
        e.appendChild(getEl(_items[i]));
      }

      this._items = _items;
      return this;
    }
  }, {
    key: "on",
    value: function on(event, callback) {
      var _this5 = this;

      this.e.addEventListener(event, function (e) {
        return callback(e, _this5);
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
/**
 * A special wrapper for large lists.
 */


exports.Wrapper = Wrapper;

var CachedWrapper = /*#__PURE__*/function (_Wrapper) {
  _inherits(CachedWrapper, _Wrapper);

  var _super = _createSuper(CachedWrapper);

  function CachedWrapper(element, cache, config) {
    var _this6;

    _classCallCheck(this, CachedWrapper);

    _this6 = _super.call(this, element);
    _this6.cache = cache;
    _this6.config = config;
    _this6._items = [];
    return _this6;
  }

  _createClass(CachedWrapper, [{
    key: "items",
    value: function items(_items2) {}
  }]);

  return CachedWrapper;
}(Wrapper);

exports.CachedWrapper = CachedWrapper;