'use strict';

var doc = document;
var throwAway = doc.createElement('template');
/**
 * Create an element from html string
 */

function makeEl(html) {
  throwAway.innerHTML = html;
  return throwAway.content.firstChild;
}
/**
 * Some utility functions
 */

var und = function und(x) {
  return x === undefined;
};
var isStr = function isStr(x) {
  return typeof x === 'string';
};

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArrayLimit(arr, i) {
  if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

/**
 * A wrapper around a DOM element.
 * All transformative methods return this (except transitions as they return promises)
 * This means those methods can be chained.
 */

var Wrapper = /*#__PURE__*/function () {
  function Wrapper(element) {
    _classCallCheck(this, Wrapper);

    this.e = element;
    this._keys = undefined;
    this._cache = undefined;
  }
  /**
   * Get element as 'e' from item, else return text node.
   */


  _createClass(Wrapper, [{
    key: "__ge",
    value: function __ge(item) {
      return item.e || doc.createTextNode(item);
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
    /**
     * Returns a promise which resolves after a transition.
     * Saves having to know times of transitions.
     */

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
    key: "cache",
    value: function cache(_cache) {
      this._cache = _cache;
      this._keys = [];
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
     * Set inner as individual item or array. Not optimised.
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
    /*
     * Set items from cache.
     */

  }, {
    key: "items",
    value: function items(_items) {
      var e = this.e;
      var childNodes = e.childNodes;
      var cache = this._cache;
      var oldKeys = this._keys;
      var newKeys = [];
      var itemsLength = _items.length;
      var canAddNow = oldKeys.length - 1;
      cache.reset();
      var start = performance.now();
      /*
       * We loop over the newKeys and pull Elements forward.
       * oldKeys will be edited in place to look like newKeys, but may have trailing
       * keys which represent the items to be removed.
       */

      for (var i = 0; i < itemsLength; i++) {
        var item = _items[i];

        var _this$_cache$getOne = this._cache.getOne(item),
            view = _this$_cache$getOne.view,
            key = _this$_cache$getOne.key;

        newKeys.push(key);

        if (i > canAddNow) {
          e.appendChild(view.e, this);
        } else if (key !== oldKeys[i]) {
          /*
           * Note: insertBefore removes the element from the DOM if attached
           * elsewhere, which should either only be further down in the
           * childNodes, or in case of a shared cache, somewhere we don't
           * care about removing it from, so its OK.
           */
          e.insertBefore(view.e, childNodes[i]);
        }
      }

      var lastIndex = childNodes.length - 1;
      var keepIndex = itemsLength - 1;

      for (var _i = lastIndex; _i > keepIndex; _i--) {
        e.removeChild(childNodes[_i]);
      }

      this._keys = newKeys;
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

/**
 * Creates and mounts a view onto an element.
 *
 * @param {unsure} elementOrId Either a string representing an id, or an element.
 * @param {class} cls The class of View to create
 * @param {object} props The props to pass to the view (optional)
 * @param {object} parent The parent view (optional)
 */

function mount(elementOrId, cls, props, parent) {
  var view = createView(cls, parent, props);
  var nodeToReplace = isStr(elementOrId) ? doc.getElementById(elementOrId.slice(1)) : elementOrId;
  nodeToReplace.parentNode.replaceChild(view.e, nodeToReplace);
  return view;
}
/**
 * Creates a view and initialises it.
 *
 * @param {class} cls The class of View to create
 * @param {object} parent The parent view (optional)
 * @param {object} props The props to pass to the view (optional)
 */

function createView(cls, parent, props) {
  var view = buildView(cls, parent);
  view.props = props;
  view.init();
  view.update();
  return view;
}
/**
 * Builds a view.
 */

function buildView(cls, parent) {
  var view = new cls(parent);

  view.__bv(view, cls.prototype);

  return view;
}
/**
 * Creates a wrapper from an HTML string.
 */

function wrap(html) {
  return new Wrapper(makeEl(html));
}
/**
 * Creates a wrapper of type tag and sets inner.
 * TODO: allow class in tag?
 */

function h(tag, inner) {
  return new Wrapper(doc.createElement(tag)).inner(inner);
}

/**
 * An object which caches and returns views of a same type, using a key Function
 * to retrieve views.
 */


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

        view.setProps(props);
      } else {
        view = createView(this.cls, parentView, props);
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
/**
 * An object which caches and returns views of a same type, caching by sequence.
 */

var SequentialCache = /*#__PURE__*/function () {
  /**
   * @param {class} cls The class of View to create.
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

        view.setProps(props);
      } else {
        view = createView(this.cls, parentView, props);
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

/**
 * RedRunner's crude way of tracking mounting and unmounting.
 */
var trackedViews = [];
var mountie = {
  track: function track(view) {
    trackedViews.push({
      view: view,
      isAttached: view.__ia()
    });
  },
  flush: function flush() {
    for (var i = 0, il = trackedViews.length; i < il; i++) {
      var trackedView = trackedViews[i];
      var view = trackedView.view;

      var attachedNow = view.__ia();

      if (attachedNow !== trackedView.isAttached) {
        var fn = attachedNow ? view.mount : view.unmount;
        fn.apply(view);
        trackedView.isAttached = attachedNow;
      }
    }
  }
};

/**
 * Used internally.
 * Represents a watch on an element.
 */
var Watch = /*#__PURE__*/function () {
  function Watch(el, shieldQuery, reverseShield, shieldCount, callbacks) {
    _classCallCheck(this, Watch);

    this.el = el; // The name of the saved element.

    this.shieldQuery = shieldQuery; // The shield query key -

    this.reverseShield = reverseShield; // whether shieldQuery should be flipped

    this.shieldCount = shieldCount; // The number of items to shield

    this.callbacks = callbacks; // Callbacks - object
  }

  _createClass(Watch, [{
    key: "shieldFor",
    value: function shieldFor(view, watch, queryCache) {
      if (this.shieldQuery) {
        var _queryCache$get = queryCache.get(view, this.shieldQuery),
            n = _queryCache$get.n;

        var visible = this.reverseShield ? n : !n;
        view.dom[watch.el].visible(visible);
        return visible ? 0 : this.shieldCount;
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

/*
 * Public members:
 *
 *  e       -- the root element
 *  nest    -- create a nested view
 *  dom     -- an object containing all the saved wrappers
 *  emit    -- emit an event to be handled by a parent views
 *  handle  -- register a function to handle an event emitted by a nested view
 *  init    -- override to set initial state
 *  parent  -- the parent view
 *  props   -- the props passed to the view
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
  function View(parent) {
    _classCallCheck(this, View);

    var s = this;
    s.parent = parent; // The parent view

    s.props = undefined; // The props passed to the view. May be changed.
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
    value: function init() {
      for (var _i = 0, _Object$entries = Object.entries(this.__ip); _i < _Object$entries.length; _i++) {
        var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
            k = _Object$entries$_i[0],
            v = _Object$entries$_i[1];

        var view = this.dom[k];
        view.props = v.apply(this);
        view.init();
      }
    }
  }, {
    key: "trackMounting",
    value: function trackMounting() {
      this.__mt.track(this);
    }
    /**
     * Updates the view.
     */

  }, {
    key: "update",
    value: function update() {
      this.__uw();

      this.__ui();

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
    value: function nest(cls, props) {
      var child = createView(cls, this, props);

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

      while (!und(target)) {
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
     * Calls the callback if the value has changed (
     */

  }, {
    key: "changed",
    value: function changed(name, callback) {
      var n = this.__ov[name];
      var o = this.props[name];

      if (n !== o) {
        callback(n, o);
      }
    }
    /**
     * Sets the props and updates the view.
     * @props -- new props, else it keeps its old (which is fine)
     */
    //TODO: rename to not camel case.

  }, {
    key: "setProps",
    value: function setProps(props) {
      this.props = props;
      this.update();
      return this;
    }
    /**
     * Build the DOM. We pass prototype as local var for speed.
     */

  }, {
    key: "__bd",
    value: function __bd(prototype, clone) {
      if (clone && !prototype.__cn) {
        prototype.__cn = makeEl(prototype.__ht);
      }

      this.e = clone ? prototype.__cn.cloneNode(true) : makeEl(prototype.__ht);
    }
    /**
     * Returns a regular wrapper around element at path, where path is an array of indices.
     * This is used by the babel plugin.
     */

  }, {
    key: "__gw",
    value: function __gw(path) {
      return new Wrapper(this.__lu(path));
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
     */

  }, {
    key: "__ia",
    value: function __ia() {
      var e = this.e;

      while (e) {
        if (e === document) {
          return true;
        }

        e = e.parentNode;
      }

      return false;
    }
  }, {
    key: "__kc",
    value: function __kc(cls, keyFn) {
      return new KeyedCache(cls, keyFn);
    }
    /**
     * Replace node at path.
     */

  }, {
    key: "__rn",
    value: function __rn(path, view) {
      this.__gw(path).replace(view.e);
    }
  }, {
    key: "__sc",
    value: function __sc(cls) {
      return new SequentialCache(cls);
    }
    /**
     * Nest Internal. For building a nested view declare in the html
     */

  }, {
    key: "__ni",
    value: function __ni(path, cls) {
      var child = buildView(cls, this);

      this.__gw(path).replace(child.e);

      return child;
    }
    /**
     * Update internal views.
     */

  }, {
    key: "__ui",
    value: function __ui() {
      for (var _i2 = 0, _Object$entries2 = Object.entries(this.__ip); _i2 < _Object$entries2.length; _i2++) {
        var _Object$entries2$_i = _slicedToArray(_Object$entries2[_i2], 2),
            k = _Object$entries2$_i[0],
            v = _Object$entries2$_i[1];

        var view = this.dom[k];
        view.setProps(v.apply(this));
      }
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
      var queryCollection = this.__qc;
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
  }]);

  return View;
}();
/**
 * The global mount tracker.
 */

View.prototype.__mt = mountie;
/**
 * Build utils used by the generated code.
 */

View.prototype.__bu = {
  _wt: function _wt(el, shieldQuery, reverseShield, shieldCount, callbacks) {
    return new Watch(el, shieldQuery, reverseShield, shieldCount, callbacks);
  },
  _qc: function _qc(callbacks) {
    return new QueryCollection(callbacks);
  }
};

module.exports = {
  createView: createView,
  h: h,
  mount: mount,
  KeyedCache: KeyedCache,
  isStr: isStr,
  SequentialCache: SequentialCache,
  View: View,
  Wrapper: Wrapper,
  wrap: wrap
};
