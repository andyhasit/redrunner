"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ViewCache = void 0;

var _utils = require("./utils");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * An object which caches and returns views of a same type.
 *
@cls -- any valid subclass of View
@cacheBy -- either:
    <undefined> in which case the sequence is used as key*
    A string used to lookup a property on the item. Can be dotted. e.g. 'user.id'
    A function called with (props, seq) which must return a key
*/
var defaultKeyFn = function defaultKeyFn(props, seq) {
  return seq;
};

var ViewCache = /*#__PURE__*/function () {
  /**
   * @param {class} cls The class of View to create
   * @param {function} keyFn A function which obtains the key to cache by
   */
  function ViewCache(cls, keyFn) {
    _classCallCheck(this, ViewCache);

    this.cls = cls;
    this.cache = {};
    this.keyFn = (0, _utils.isStr)(keyFn) ? function (props) {
      return props[keyFn];
    } : keyFn || defaultKeyFn;
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
        view = (0, _utils.createView)(this.cls, props, parentView, this._seq);
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

exports.ViewCache = ViewCache;