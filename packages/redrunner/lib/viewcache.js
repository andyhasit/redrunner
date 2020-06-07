"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SequentialCache = exports.KeyedCache = void 0;

var _utils = require("./utils");

var _helpers = require("./helpers");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

//TODO remove

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
}; // export class ViewCache {
//   /**
//    * @param {class} cls The class of View to create
//    * @param {function} keyFn A function which obtains the key to cache by
//    */
//   constructor(cls, keyFn) {
//     this.cls = cls
//     this.cache = {}
//     this.keyFn = keyFn
//     this._seq = 0
//   }
//   getMany(items, parentView, reset) {
//     if (reset) {
//       this.reset()
//     }
//     return items.map(props => this.getOne(props, parentView))
//   }
//   getOne(props, parentView) {
//     Gets a view, potentially from cache
//     let view, key = this.keyFn(props, this._seq)
//     // TODO: can I detect whether we use seq?
//     if (this.cache.hasOwnProperty(key)) {
//       view = this.cache[key]
//       if (parentView !== view.parent) {
//         view.move(parentView)
//       }
//       view.update(props)
//     } else {
//       // Don't use nest
//       view = createView(this.cls, props, parentView, this._seq)
//       this.cache[key] = view
//     }
//     this._seq += 1
//     return view
//   }
//   reset() {
//     this._seq = 0
//   }
// }


var KeyedCache = /*#__PURE__*/function () {
  /**
   * @param {class} cls The class of View to create
   * @param {function} keyFn A function which obtains the key to cache by
   */
  function KeyedCache(cls, keyFn) {
    _classCallCheck(this, KeyedCache);

    this.cls = cls;
    this.cache = {};
    this.keyFn = keyFn;
    this._seq = 0;
  }

  _createClass(KeyedCache, [{
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
    /**
     * Gets a view, potentially from cache
     */

  }, {
    key: "getOne",
    value: function getOne(props, parentView) {
      var view,
          key = this.keyFn(props);

      if (this.cache.hasOwnProperty(key)) {
        view = this.cache[key];

        if (parentView !== view.parent) {
          view.move(parentView);
        }

        view.update(props);
      } else {
        view = (0, _utils.createView)(this.cls, props, parentView, this._seq);
        this.cache[key] = view;
      }

      this._seq += 1;
      return {
        view: view,
        key: key
      };
    }
  }, {
    key: "reset",
    value: function reset() {
      this._seq = 0;
    }
  }]);

  return KeyedCache;
}();

exports.KeyedCache = KeyedCache;

var SequentialCache = /*#__PURE__*/function () {
  /**
   * @param {class} cls The class of View to create
   * @param {function} keyFn A function which obtains the key to cache by
   */
  function SequentialCache(cls) {
    _classCallCheck(this, SequentialCache);

    this.cls = cls;
    this.cache = [];
    this._seq = 0;
  }
  /**
   * Gets a view, potentially from cache
   */


  _createClass(SequentialCache, [{
    key: "getOne",
    value: function getOne(props, parentView) {
      var view;

      if (this._seq < this.cache.length) {
        view = this.cache[this._seq];

        if (parentView !== view.parent) {
          view.move(parentView);
        }

        view.update(props);
      } else {
        view = (0, _utils.createView)(this.cls, props, parentView, this._seq);
        this.cache.push(view);
      }

      this._seq += 1;
      return {
        view: view,
        key: this._seq
      };
    }
  }, {
    key: "reset",
    value: function reset() {
      this._seq = 0;
    }
  }]);

  return SequentialCache;
}();

exports.SequentialCache = SequentialCache;