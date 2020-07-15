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

/**
 * A wrapper around a DOM element.
 * All transformative methods return this (except transitions as they return promises)
 * This means those methods can be chained.
 */

function Wrapper(element) {
  this.e = element;
  this._keys = undefined;
  this._cache = undefined;
}
var proto = Wrapper.prototype;
/**
 * Get element as 'e' from item, else return text node.
 */

proto.__ge = function (item) {
  return item.e || doc.createTextNode(item);
};
/**
 * Gets the element's value. Cannot be chained.
 */


proto.getValue = function () {
  /* Returns the value of the element */
  return this.e.value;
};
/**
 * Returns a promise which resolves after a transition.
 * Saves having to know times of transitions.
 */


proto.transition = function (fn) {
  var _this = this;

  return new Promise(function (resolve) {
    fn();

    var transitionEnded = function transitionEnded(e) {
      _this.e.removeEventListener('transitionend', transitionEnded);

      resolve();
    };

    _this.e.addEventListener('transitionend', transitionEnded);
  });
};
/* Every method below must return 'this' so it can be chained */


proto.append = function (item) {
  this.e.appendChild(this.__ge(item));
  return this;
};

proto.att = function (name, value) {
  this.e.setAttribute(name, value);
  return this;
};

proto.atts = function (atts) {
  for (var name in atts) {
    this.att(name, atts[name]);
  }

  return this;
};

proto.cache = function (cache) {
  this._cache = cache;
  this._keys = [];
  return this;
};

proto.clear = function () {
  this.e.innerHTML = '';
  this.e.textContent = '';
  this.e.value = '';
  return this;
};

proto.checked = function (value) {
  this.e.checked = value;
  return this;
};

proto.child = function (wrapper) {
  this.e.innerHTML = '';
  this.e.appendChild(wrapper.e);
  return this;
};

proto.css = function (style) {
  this.e.className = style;
  return this;
};

proto.cssAdd = function (style) {
  this.e.classList.add(style);
  return this;
};

proto.cssAddTrans = function (style) {
  var _this2 = this;

  return this.transition(function (_) {
    return _this2.e.classList.add(style);
  });
};

proto.cssRemove = function (style) {
  this.e.classList.remove(style);
  return this;
};

proto.cssRemoveTrans = function (style) {
  var _this3 = this;

  return this.transition(function (_) {
    return _this3.e.classList.remove(style);
  });
};

proto.cssToggle = function (style) {
  this.e.classList.toggle(style);
  return this;
};

proto.href = function (value) {
  return this.att('href', value);
};

proto.html = function (html) {
  this.e.innerHTML = html;
  return this;
};

proto.id = function (value) {
  return this.att('id', value);
};
/*
 * Set inner as individual item or array. Not optimised.
 */


proto.inner = function (items) {
  if (!Array.isArray(items)) {
    items = [items];
  }

  var e = this.e;
  e.innerHTML = '';

  for (var i = 0, il = items.length; i < il; i++) {
    e.appendChild(this.__ge(items[i]));
  }

  return this;
};
/*
 * Set items from cache.
 */


proto.items = function (items) {
  var e = this.e;
  var childNodes = e.childNodes;
  var cache = this._cache;
  var oldKeys = this._keys;
  var newKeys = [];
  var itemsLength = items.length;
  var canAddNow = oldKeys.length - 1;
  cache.reset();
  /*
   * We loop over the newKeys and pull Elements forward.
   * oldKeys will be edited in place to look like newKeys, but may have trailing
   * keys which represent the items to be removed.
   */

  for (var i = 0; i < itemsLength; i++) {
    var item = items[i];

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
};

proto.on = function (event, callback) {
  var _this4 = this;

  this.e.addEventListener(event, function (e) {
    return callback(e, _this4);
  });
  return this;
};

proto.replace = function (el) {
  this.e.parentNode.replaceChild(el, this.e);
  return this;
};

proto.src = function (value) {
  return this.att('src', value);
};

proto.style = function (name, value) {
  this.e.style[name] = value;
  return this;
};

proto.text = function (value) {
  this.e.textContent = value;
  return this;
};

proto.visible = function (visible) {
  return this.style('visibility', visible ? 'visible' : 'hidden');
};

proto.value = function (value) {
  return this.att('value', value);
};

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
     * Gets a view, potentially from cache.
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
   * Gets a view, potentially from cache.
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
 * Used internally. Represents a watch on an element.
 */
function Watch(el, shieldQuery, reverseShield, shieldCount, callbacks) {
  this.el = el; // The name of the saved element.

  this.shieldQuery = shieldQuery; // The shield query key -

  this.reverseShield = reverseShield; // whether shieldQuery should be flipped

  this.shieldCount = shieldCount; // The number of items to shield

  this.callbacks = callbacks; // Callbacks - object
}
var proto$1 = Watch.prototype;

proto$1.appyCallbacks = function (view) {
  for (var _i = 0, _Object$entries = Object.entries(this.callbacks); _i < _Object$entries.length; _i++) {
    var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
        key = _Object$entries$_i[0],
        callback = _Object$entries$_i[1];

    if (key === '*') {
      callback.apply(view);
    } else {
      // means: {new, old, changed}
      var _view$lookup = view.lookup(key),
          n = _view$lookup.n,
          o = _view$lookup.o,
          c = _view$lookup.c;

      if (c) {
        callback.apply(view, [n, o]);
      }
    }
  }
};

/**
 * Used internally.
 * An object which caches the results of queries.
 * Intended to be shared between instances of a view.
 * Must call reset() on every update.
 */
function QueryCollection(queryCallbacks) {
  this.qc = queryCallbacks;
  this.run = {};
}
var proto$2 = QueryCollection.prototype;

proto$2.reset = function () {
  this.run = {};
};

proto$2.get = function (view, key) {
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
  }

  return run[key];
};

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
 *  updateNested (Update Nested Views)
 *  updateSelf (Update Watches)
 *  __wc (Watcher Callbacks)
 *
 */

var View = /*#__PURE__*/function () {
  function View(parent) {
    _classCallCheck(this, View);

    var s = this;
    s.parent = parent; // The parent view

    s.props = undefined; // The props passed to the view. May be changed.
    // These will be set during build

    s.e = null; // the element

    s.dom = null; // the named wrappers
    // Internal state objects

    s.__nv = []; // Nested views

    s.__ov = {}; // The old values for watches to compare against
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
     * Lookup a watched value during update. Returns an object with {o, n, c}
     * (oldValue, newValue, changed).
     * You must call this.resetLookups before calling this during an update.
     * The point is to cache the result so it doesn't have to be repeated.
     */

  }, {
    key: "lookup",
    value: function lookup(query) {
      return this.__qc.get(this, query);
    }
    /**
     * Resets the lookups, muct be called before calling this.lookup() during an update.
     */

  }, {
    key: "resetLookups",
    value: function resetLookups() {
      this.__qc.reset();
    }
    /**
     * Sets the props and updates the view.
     */

  }, {
    key: "setProps",
    value: function setProps(props) {
      this.props = props;
      this.update();
      return this;
    }
    /**
     * Call this if you want to get mount() and unmount() callbacks.
     */

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
      this.resetLookups();
      this.updateSelf();
      this.updateNested();
    }
    /**
     * UpdateSelf
     *
     * Loops over watches skipping shielded watches if elements are hidden.
     */

  }, {
    key: "updateSelf",
    value: function updateSelf() {
      var i = 0,
          watch,
          shieldCount,
          shieldQueryBooleanResult,
          shouldBeVisible;
      var watches = this.__wc;

      if (!watches) {
        return;
      }

      var il = watches.length; //c.log(watches)

      while (i < il) {
        watch = watches[i];
        i++;
        shouldBeVisible = true;

        if (watch.shieldQuery) {
          // Get the newValue for shieldQuery using lookup
          shieldQueryBooleanResult = this.lookup(watch.shieldQuery).n; // Determine if shouldBeVisible based on reverseShield
          // i.e. whether "shieldQuery==true" means show or hide.

          shouldBeVisible = watch.reverseShield ? shieldQueryBooleanResult : !shieldQueryBooleanResult; // The number of watches to skip if this element is not visible

          shieldCount = shouldBeVisible ? 0 : watch.shieldCount; // Set the element visibility

          this.dom[watch.el].visible(shouldBeVisible);
          i += shieldCount;
        }

        if (shouldBeVisible) {
          watch.appyCallbacks(this);
        }
      }
    }
    /**
     * Update nested views (but not repeat elements).
     */

  }, {
    key: "updateNested",
    value: function updateNested() {
      // These are user created by calling next()
      var items = this.__nv;

      for (var i = 0, il = items.length; i < il; i++) {
        var child = items[i];

        if (child.__ia()) {
          child.update();
        }
      } // These are created with directives, and whose props arguments may need reprocessed.


      for (var _i2 = 0, _Object$entries2 = Object.entries(this.__ip); _i2 < _Object$entries2.length; _i2++) {
        var _Object$entries2$_i = _slicedToArray(_Object$entries2[_i2], 2),
            k = _Object$entries2$_i[0],
            v = _Object$entries2$_i[1];

        var view = this.dom[k];
        view.setProps(v.apply(this));
      }
    }
    /**
     * Calls the callback if the value has changed (
     */
    // changed(name, callback) {
    //   const n = this.__ov[name]
    //   const o = this.props[name]
    //   if (n !== o) {
    //     callback(n, o)
    //   }
    // }

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
     * Nest Internal. For building a nested view declared in the html
     */

  }, {
    key: "__ni",
    value: function __ni(path, cls) {
      var child = buildView(cls, this);

      this.__gw(path).replace(child.e);

      return child;
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
