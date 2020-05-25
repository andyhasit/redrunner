"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Store = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Store = /*#__PURE__*/function () {
  function Store(items) {
    _classCallCheck(this, Store);

    this.nextId = 1;
    this.changed = 0;
    this.items = [];
    this.hash = {};
    this.load(items);
  }

  _createClass(Store, [{
    key: "add",
    value: function add(item) {
      this.changed;
      return Promise.resolve(this._add(item));
    }
  }, {
    key: "_add",
    value: function _add(item) {
      item.id = this.nextId;
      this.nextId++;
      this.items.push(item);
      this.hash[item.id] = item;
      return item;
    }
  }, {
    key: "update",
    value: function update(id, item) {
      var target = this.hash[id];
      Object.assign(target, item, {
        id: id
      });
      this.changed;
      return Promise.resolve(target);
    }
  }, {
    key: "get",
    value: function get(id) {
      return this.hash[id];
    }
  }, {
    key: "getItems",
    value: function getItems() {
      return this.items;
    }
  }, {
    key: "delete",
    value: function _delete(id) {
      this.items = this.items.filter(function (item) {
        return item.id !== id;
      });
      delete this.hash[id];
      this.changed;
      return Promise.resolve(id);
    }
  }, {
    key: "load",
    value: function load(items) {
      var _this = this;

      items.forEach(function (item) {
        return _this._add(item);
      });
    }
  }]);

  return Store;
}();

exports.Store = Store;