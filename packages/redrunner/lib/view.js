"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.View = void 0;

var _viewcache = require("./viewcache");

var _utils = require("./utils");

var _helpers = require("./helpers");

var _wrapper = require("./wrapper");

var _watch = require("./watch");

var _querycollection = require("./querycollection");

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
      return new _viewcache.KeyedCache(cls, keyFn);
    }
  }, {
    key: "__sc",
    value: function __sc(cls) {
      return new _viewcache.SequentialCache(cls);
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
      var queryCollection = this.queryCollection;
      queryCollection.reset();

      while (i < il) {
        watch = watches[i];
        shield = watch.shieldFor(this, watch, queryCollection);

        if (shield) {
          i += shield;
          continue;
        }

        watch.appyCallbacks(this, queryCollection);
        i++;
      }
    }
    /**
     * Replace node at path.
     */

  }, {
    key: "__rn",
    value: function __rn(path, view) {
      this.__gw(path).replace(view.e);
    }
  }]);

  return View;
}();
/**
 * This is used by the generated code.
 */


exports.View = View;
View.prototype.buildUtils = {
  getWatch: function getWatch(el, shieldQuery, reverseShield, callbacks) {
    return new _watch.Watch(el, shieldQuery, reverseShield, callbacks);
  },
  getQueryCollection: function getQueryCollection(callbacks) {
    return new _querycollection.QueryCollection(callbacks);
  }
};