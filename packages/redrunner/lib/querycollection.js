"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.QueryCollection = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Used internally.
 * An object which caches the results of queries.
 * Intended to be shared between instances of a view.
 * Must call reset() on every update.
 */
var QueryCollection = /*#__PURE__*/function () {
  function QueryCollection(queryCallbacks) {
    _classCallCheck(this, QueryCollection);

    this.qc = queryCallbacks;
    this.run = {};

    for (var key in queryCallbacks) {
      this.run[key] = undefined;
    }
  }

  _createClass(QueryCollection, [{
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

  return QueryCollection;
}();

exports.QueryCollection = QueryCollection;