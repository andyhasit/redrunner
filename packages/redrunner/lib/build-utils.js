"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildUtils = void 0;

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Used internally.
 * An object which caches the results of queries.
 * Intended to be shared between instances of a view.
 * Must call reset() on every update.
 */
var QueryCache = /*#__PURE__*/function () {
  function QueryCache(queryCallbacks) {
    _classCallCheck(this, QueryCache);

    this.qc = queryCallbacks;
    this.run = {};

    for (var key in queryCallbacks) {
      this.run[key] = undefined;
    }
  }

  _createClass(QueryCache, [{
    key: "reset",
    value: function reset() {
      var run = this.run;

      for (var key in run) {
        run[key] = undefined;
      }
    }
  }, {
    key: "get",
    value: function get(view, key) {
      var run = this.run;

      if (run[key] === undefined) {
        // Verbose but efficient way as it avoids lookups?
        var o = view.__ov[key];
        var n = this.qc[key].apply(view);
        var c = n !== o;
        view.__ov[key] = n;
        var rtn = {
          n: n,
          o: o,
          c: c
        };
        run[key] = rtn;
        return rtn;
      } else {
        return run[key];
      }
    }
  }]);

  return QueryCache;
}();
/**
 * Used internally.
 * Represents a watch on an element.
 */


var Watch = /*#__PURE__*/function () {
  function Watch(el, shieldQuery, callbacks) {
    _classCallCheck(this, Watch);

    this.el = el; // The name of the saved element.

    this.shieldQuery = shieldQuery; // The shield query key -

    this.callbacks = callbacks; // Callbacks - object

    this.blockCount = 1;
    this.reverse = false; // whether shieldQuery should be flipped
  }

  _createClass(Watch, [{
    key: "shieldFor",
    value: function shieldFor(view, watch, queryCache) {
      if (this.shieldQuery) {
        var _queryCache$get = queryCache.get(view, this.shieldQuery),
            n = _queryCache$get.n;

        var hide = this.reverse ? !n : n;
        view.dom[watch.el].visible(!hide);
        return hide ? this.blockCount : 0;
      }

      return 0;
    }
  }, {
    key: "appyCallbacks",
    value: function appyCallbacks(view, queryCache) {
      for (var _i = 0, _Object$entries = Object.entries(this.callbacks); _i < _Object$entries.length; _i++) {
        var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
            key = _Object$entries$_i[0],
            callback = _Object$entries$_i[1];

        if (key === '*') {
          callback.apply(view);
        } else {
          // means: {new, old, changed}
          var _queryCache$get2 = queryCache.get(view, key),
              n = _queryCache$get2.n,
              o = _queryCache$get2.o,
              c = _queryCache$get2.c;

          if (c) {
            callback.apply(view, [n, o]);
          }
        }
      }
    }
  }]);

  return Watch;
}();

var buildUtils = {
  getWatch: function getWatch(el, shieldQuery, callbacks) {
    return new Watch(el, shieldQuery, callbacks);
  },
  getQueryCache: function getQueryCache(callbacks) {
    return new QueryCache(callbacks);
  }
};
exports.buildUtils = buildUtils;