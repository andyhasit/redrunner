"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.View = void 0;

var _utils = require("./utils");

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
 *  nest    -- create a nested view
 *  debug   -- prints out debug info
 *  dom     -- an object containing all the saved wrappers
 *  emit    -- emit an event to be handled by a parent views
 *  handle  -- register a function to handle an event emitted by a nested view
 *  init    -- override to set initial state 
 *  parent  -- the parent view
 *  props   -- the props passed to the view
 *  root    -- the root wrapper (should root even be a wrapper?)
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
    // These will be set by __bv()

    s.root = null; // the root wrapper, will be set by __bv

    s.dom = null; // the named wrappers, will be set by __bv
  }
  /* This field gets transformed by the babel plugin.
   * Providing a default here so that child classes get processed.
   */


  _createClass(View, [{
    key: "init",
    value: function init() {// Gets called once
    }
  }, {
    key: "update",
    value: function update(props) {
      /*  
       *   The external call to update the view. 
       *   @props -- new props, else it keeps its old (which is fine)
       */
      if (!(0, _utils.und)(props)) {
        this.props = props;
      }

      this.__uw();

      this.__un();
    }
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
  }, {
    key: "nest",
    value: function nest(cls, props, seq) {
      /*
       * Builds a nested view of the specified class. Its up to you how you attach it.
       * No caching is used. Use a cache object returned by this.cache() if you need caching.
       */
      var child = (0, _utils.createView)(cls, props, this, seq);

      this.__nv.push(child);

      return child;
    }
  }, {
    key: "emit",
    value: function emit(name, args) {
      var target = this;

      while (!(0, _utils.und)(target)) {
        var handlers = target._handlers_;

        if (name in handlers) {
          return handlers[name].apply(target, args);
        }

        target = target.parent;
      }
    }
  }, {
    key: "old",
    value: function old(name) {
      return this.__ov[name];
    }
  }, {
    key: "watch",
    value: function watch(path, callback) {
      /*
      Watch a property and call the callback during update if it has changed.
       @path -- A dotted path to the value
         e.g. 'user.id'
      
      @callback -- a function to be called with (newValue, oldValue)
      
        e.g. (n,o) => alert(`Value changed from ${o} to ${n}`)
       */
      if (!this.__wc.hasOwnProperty(path)) {
        this.__wc[path] = [];
      }

      this.__wc[path].push(callback);

      return this; // Keep this because people may use it like on the wrapper.
    } // /**
    //  * Build from clone. The __bv method will call this if the class was set to clone.
    //  */
    // __fc(view, prototype) {
    //   if (!prototype.__cn) {
    //     prototype.__cn = makeEl(prototype.__ht)
    //   }
    //   this.__sr(prototype.cloneNode(true))
    // }
    // /**
    //  * Build from html. The __bv method will call this if the class was not set to clone.
    //  */ 
    // __fh(prototype) {
    //   this.__sr((makeEl(prototype.__ht))
    // }

    /**
     * Build the DOM. We pass prototype as local var for speed.
     */

  }, {
    key: "__bd",
    value: function __bd(prototype, clone) {
      if (clone && !prototype.__cn) {
        prototype.__cn = (0, _utils.makeEl)(prototype.__ht);
      }

      var element = clone ? prototype.__cn.cloneNode(true) : (0, _utils.makeEl)(prototype.__ht);

      this.__sr(element);
    }
    /**
     * Set root
     */

  }, {
    key: "__sr",
    value: function __sr(el) {
      this.root = new _utils.Wrapper(el);
    }
    /**
     * Returns a wrapper around element at path, where path is an array of indices.
     * This is used by the babel plugin.
     */

  }, {
    key: "__gw",
    value: function __gw(path) {
      return new _utils.Wrapper(this.__lu(path));
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
      }, this.root.e);
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

      return el.root.e.parentNode;
    }
  }, {
    key: "__nc",
    value: function __nc(cls, keyFn) {
      return new _utils.ViewCache(cls, keyFn);
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
     * UpdateWatches. Iterates through watches. If the value has changed, or it is
     * an empty watch ('') call callback.
     *
     */

  }, {
    key: "__uw",
    value: function __uw() {
      var path, newValue, oldValue, callbacks;

      for (path in this.__wc) {
        newValue = this.__wq[path].apply(this);
        oldValue = this.__ov[path];

        if (path === '' || oldValue !== newValue) {
          callbacks = this.__wc[path];

          for (var i = 0, il = callbacks.length; i < il; i++) {
            callbacks[i].apply(this, [newValue, oldValue]);
          }
        }

        this.__ov[path] = newValue;
      }
    }
  }, {
    key: "__rn",
    value: function __rn(path, view) {
      this.__gw(path).replace(view.root.e);
    }
    /* Currently unused, but we may use it in future strategy
     */
    // _cloneNode_() {
    //   let ct = this._ct_
    //   if (!ct._template_) {
    //     let throwAway = document.createElement('template')
    //     // let tidy = raw.replace(/\n/g, "")
    //     //   .replace(/[\t ]+\</g, "<")
    //     //   .replace(/\>[\t ]+\</g, "><")
    //     //   .replace(/\>[\t ]+$/g, ">")
    //     throwAway.innerHTML = ct.html.trim()
    //     ct._template_ = throwAway.content.firstChild
    //   }
    //   return ct._template_.cloneNode(true)
    // }

  }]);

  return View;
}();

exports.View = View;

View.prototype.__bv = function (view, wrap) {
  view.root = wrap("<div></div>");
  view.dom = {};
};