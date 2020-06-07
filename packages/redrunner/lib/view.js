"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.View = void 0;

var _viewCache = require("./view-cache");

var _utils = require("./utils");

var _helpers = require("./helpers");

var _wrapper = require("./wrapper");

var _buildUtils = require("./build-utils");

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var c = console;
/*
 * Public members:
 *
 *  e       -- the root element
 *  nest    -- create a nested view
 *  debug   -- prints out debug info
 *  dom     -- an object containing all the saved wrappers
 *  emit    -- emit an event to be handled by a parent views
 *  handle  -- register a function to handle an event emitted by a nested view
 *  init    -- override to set initial state
 *  parent  -- the parent view
 *  props   -- the props passed to the view
 *  seq     -- the sequence
 *  update  -- method which gets called when a view is updated
 *
 * Private members (for internal use) start with __ and are listed here:
 *
 *  __bv (BuildView)  -- is built by babel
 *  __bd (BuildDOM)
 *  __ia (IsAttached)
 *  __gw (GetWrapper) -- returns a wrapper at a specific path
 *  __nv (NestedViews)
 *  __ov (OldValues)
 *  __rn (ReplaceNode)
 *  __un (Update Nested Views)
 *  __uw (Update Watches)
 *  __wc (Watcher Callbacks)
 *
 */

var View = /*#__PURE__*/function () {
  function View(parent, props, seq) {
    _classCallCheck(this, View);

    var s = this;
    s.parent = parent; // The parent view

    s.props = props; // The props passed to the view. May be changed

    s.seq = seq; // The sequence - only for nested views
    // Internal state objects

    s.__nv = []; // Array of nested views
    // These relate to watchers

    s.__ov = {}; // The old values for watches to compare against
    // These will be set during build

    s.e = null; // the element

    s.dom = null; // the named wrappers
  }
  /**
   * This field gets transformed by the babel plugin.
   * Providing a default here so that child classes get processed.
   */
  //__html__ = '<div/>'

  /**
   * Gets called once immediately after building.
   */


  _createClass(View, [{
    key: "init",
    value: function init() {}
    /**
     *   The external call to update the view.
     *   @props -- new props, else it keeps its old (which is fine)
     */

  }, {
    key: "update",
    value: function update(props) {
      if (!(0, _helpers.und)(props)) {
        this.props = props;
      }

      this.__uw();

      this.__un();
    }
    /**
     * Prints debug information. Maybe think of a better way of displaying this.
     */

  }, {
    key: "debug",
    value: function debug() {
      c.log(this.__bv.toString());
      var lines = [];
      lines.push('__wc: {');

      for (var _i = 0, _Object$entries = Object.entries(this.__wc); _i < _Object$entries.length; _i++) {
        var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
            name = _Object$entries$_i[0],
            callbacks = _Object$entries$_i[1];

        lines.push("  \"".concat(name, "\": ["));
        callbacks.forEach(function (e) {
          return lines.push('  ' + e.toString());
        });
        lines.push('  ]');
      }

      lines.push('}');
      c.log(lines.join('\n'));
    }
    /**
     * Move the view to new parent.
     */

  }, {
    key: "move",
    value: function move(newParent) {
      if (this.parent && this.parent.__nv) {
        var nv = this.parent.__nv;
        nv.splice(nv.indexOf(this), 1);
      }

      this.parent = newParent;
    }
    /**
     * Builds a nested view of the specified class. Its up to you how you use it.
     */

  }, {
    key: "nest",
    value: function nest(cls, props, seq) {
      var child = (0, _utils.createView)(cls, props, this, seq);

      this.__nv.push(child);

      return child;
    }
    /**
     * Was intended as a way to bubble events up the tree. Not sure if needed.
     */

  }, {
    key: "emit",
    value: function emit(name, args) {
      var target = this;

      while (!(0, _helpers.und)(target)) {
        var handlers = target._handlers_;

        if (name in handlers) {
          return handlers[name].apply(target, args);
        }

        target = target.parent;
      }
    }
    /**
     * Returns the old value of a watch. Must use shorthand notation e.g. "..items"
     */

  }, {
    key: "old",
    value: function old(name) {
      return this.__ov[name];
    }
    /**
     * Build the DOM. We pass prototype as local var for speed.
     */

  }, {
    key: "__bd",
    value: function __bd(prototype, clone) {
      if (clone && !prototype.__cn) {
        prototype.__cn = (0, _helpers.makeEl)(prototype.__ht);
      }

      this.e = clone ? prototype.__cn.cloneNode(true) : (0, _helpers.makeEl)(prototype.__ht);
    }
    /**
     * Returns a regular wrapper around element at path, where path is an array of indices.
     * This is used by the babel plugin.
     */

  }, {
    key: "__gw",
    value: function __gw(path) {
      return new _wrapper.Wrapper(this.__lu(path));
    }
    /**
     * Returns an element at specified path, where path is an array of indices.
     * This is used by the babel plugin.
     */

  }, {
    key: "__lu",
    value: function __lu(path) {
      return path.reduce(function (acc, index) {
        return acc.childNodes[index];
      }, this.e);
    }
    /**
     * Is Attached.
     * Determines whether this view is attached to the DOM.
     *
     * Note: currently unreliable as the view could be attached to an element which is itself detached.
     */

  }, {
    key: "__ia",
    value: function __ia() {
      var el = this; // let element =
      // while (element != document && element.parentNode) {
      //   /* jump to the parent element */
      //   element = element.parentNode;
      // }

      return el.e.parentNode;
    }
  }, {
    key: "__kc",
    value: function __kc(cls, keyFn) {
      return new _viewCache.KeyedCache(cls, keyFn);
    }
  }, {
    key: "__sc",
    value: function __sc(cls) {
      return new _viewCache.SequentialCache(cls);
    }
    /**
     * Update nested views.
     */

  }, {
    key: "__un",
    value: function __un() {
      var items = this.__nv;

      for (var i = 0, il = items.length; i < il; i++) {
        var child = items[i];

        if (child.__ia()) {
          child.update();
        }
      }
    }
    /**
     * UpdateWatches.
     *
     * Calls update on all watches if watched value has changed, skipping shielded watches.
     */

  }, {
    key: "__uw",
    value: function __uw() {
      var i = 0,
          watch,
          shield;
      var watches = this.__wc;

      if (!watches) {
        return;
      }

      var il = watches.length;
      var queryCache = this.queryCache;
      queryCache.reset();

      while (i < il) {
        watch = watches[i];
        shield = watch.shieldFor(this, watch, queryCache);

        if (shield) {
          i += shield;
          continue;
        }

        watch.appyCallbacks(this, queryCache);
        i++;
      }
      /*
      TODO: need a different algorithm, whereby the first thing we check is whether that
      element shows.
         while (i < il) {
        let {el, shield, callbacks} = watches[i]
        for (let [key, callback] of Object.entries(callbacks)) {
          if (key === '*') {
            callback.apply(this)
          } else {
            if (key in queries) {
              [newValue, oldValue, hasChanged] = queries[key]
            } else {
              oldValue = this.__ov[key]
              newValue = this.__wq[key].apply(this)
              hasChanged = newValue !== oldValue
              this.__ov[key] = newValue
              queries[key] = [newValue, oldValue, hasChanged]
            }
            if (hasChanged) {
              callback.apply(this, [newValue, oldValue])
            }
          }
        }
        i = (shield && el._shield) ? i + shield + 1 : i + 1
        //i ++
      }
      */

    }
  }, {
    key: "__rn",
    value: function __rn(path, view) {
      this.__gw(path).replace(view.e);
    }
  }]);

  return View;
}();
/**
 * This just creates a default.
 */


exports.View = View;
View.prototype.__ht = '<div></div>';
/**
 * This is used by the generated code.
 */

View.prototype.buildUtils = _buildUtils.buildUtils;