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
  this._cache = undefined;
}
Wrapper.prototype = {
  /**
   * Get element as 'e' from item, else return text node.
   */
  __ge: function __ge(item) {
    return item.e || doc.createTextNode(item);
  },

  /**
   * Gets an attribute from the element. Cannot be chained.
   */
  getAtt: function getAtt(name) {
    return this.e[name];
  },

  /**
   * Gets the element's value. Cannot be chained.
   */
  getValue: function getValue() {
    return this.e.value;
  },
  isChecked: function isChecked() {
    return this.e.checked;
  },

  /* Every method below must return 'this' so it can be chained */
  append: function append(item) {
    this.e.appendChild(this.__ge(item));
    return this;
  },
  att: function att(name, value) {
    this.e.setAttribute(name, value);
    return this;
  },
  atts: function atts(_atts) {
    for (var name in _atts) {
      this.att(name, _atts[name]);
    }

    return this;
  },
  cache: function cache(_cache) {
    this._cache = _cache;
    return this;
  },
  clear: function clear() {
    this.e.innerHTML = '';
    this.e.textContent = '';
    this.e.value = '';
    return this;
  },
  checked: function checked(value) {
    this.e.checked = !!value;
    return this;
  },
  child: function child(wrapper) {
    this.e.innerHTML = '';
    this.e.appendChild(wrapper.e);
    return this;
  },
  css: function css(style) {
    this.e.className = style;
    return this;
  },
  cssAdd: function cssAdd(style) {
    this.e.classList.add(style);
    return this;
  },
  cssRemove: function cssRemove(style) {
    this.e.classList.remove(style);
    return this;
  },
  cssToggle: function cssToggle(style) {
    this.e.classList.toggle(style);
    return this;
  },
  href: function href(value) {
    return this.att('href', value);
  },
  html: function html(_html) {
    this.e.innerHTML = _html;
    return this;
  },
  id: function id(value) {
    return this.att('id', value);
  },

  /*
   * Set inner as individual item or array. Not optimised.
   */
  inner: function inner(items) {
    if (!Array.isArray(items)) {
      items = [items];
    }

    var e = this.e;
    e.innerHTML = '';

    for (var i = 0, il = items.length; i < il; i++) {
      e.appendChild(this.__ge(items[i]));
    }

    return this;
  },

  /*
   * Set items from cache.
   */
  items: function items(_items, parent) {
    this._cache.patch(this.e, _items, parent);

    return this;
  },
  on: function on(event, callback) {
    var _this = this;

    this.e.addEventListener(event, function (e) {
      return callback(_this, e);
    });
    return this;
  },
  replace: function replace(el) {
    this.e.parentNode.replaceChild(el, this.e);
    return this;
  },
  src: function src(value) {
    return this.att('src', value);
  },
  style: function style(name, value) {
    this.e.style[name] = value;
    return this;
  },
  swap: function swap(key, parent) {
    this.child(this._cache.getOne(key, parent));
    return this;
  },
  text: function text(value) {
    this.e.textContent = value;
    return this;
  },
  visible: function visible(_visible) {
    this.e.classList.toggle('hidden', !_visible);
    return this;
  },
  value: function value(_value) {
    this.e.value = _value;
    return this;
  }
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
  var nodeToReplace = isStr(elementOrId) ? doc.getElementById(elementOrId) : elementOrId;
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
 * Creates a wrapper of type tag e.g. h('div')
 */

function h(tag) {
  return new Wrapper(doc.createElement(tag));
}

/**
 * Caches same type views, retrieving by sequence.
 * Must not be shared.
 * 
 * @param {class} viewClass - The class of View to create.
 * @param {function} keyFn - A function which obtains the key to cache by
 */

function KeyedCache(viewClass, keyFn) {
  this._v = viewClass;
  this._f = keyFn;
  this._k = []; // keys

  this._p = {}; // pool of view instances
}
var proto = KeyedCache.prototype;
/**
 * Retrieves a single view. Though not used in RedRunner itself, it may
 * be used elsewhere, such as in the router.
 * 
 * @param {Object} item - The item which will be passed as props.
 * @param {View} parent - The parent view.
 */

proto.getOne = function (item, parent) {
  return this._get(this._p, this._v, this._f(item), item, parent);
};
/**
 * Updates the element's childNodes to match the items.
 * Performance is important.
 * 
 * @param {DOMElement} e - The DOM element to patch.
 * @param {Array} items - Array of items which will be passed as props.
 * @param {View} parent - The parent view.
 */


proto.patch = function (e, items, parent) {
  var pool = this._p;
  var viewClass = this._v;
  var keyFn = this._f;
  var childNodes = e.childNodes;
  var itemsLength = items.length;
  var oldKeySequence = this._k;
  var newKeys = [];
  var item,
      key,
      view,
      childElementCount = oldKeySequence.length + 1;

  for (var i = 0; i < itemsLength; i++) {
    item = items[i];
    key = keyFn(item);
    view = this._get(pool, viewClass, key, item, parent);
    newKeys.push(key);

    if (i > childElementCount) {
      e.appendChild(view.e);
    } else if (key !== oldKeySequence[i]) {
      e.insertBefore(view.e, childNodes[i]);
      pull(oldKeySequence, key, i);
    }
  }

  this._k = newKeys;
  trimChildren(e, childNodes, itemsLength);
}; // Internal


proto._get = function (pool, viewClass, key, item, parent) {
  var view;

  if (pool.hasOwnProperty(key)) {
    view = pool[key];
    view.setProps(item);
  } else {
    view = createView(viewClass, parent, item);
    pool[key] = view;
  }

  return view;
};
/**
 * Caches same type views, retrieving by sequence.
 * Must not be shared.
 * 
 * @param {class} viewClass - The class of View to create.
 */


function SequentialCache(viewClass) {
  this._v = viewClass;
  this._p = []; // pool of view instances

  this._c = 0; // Child element count
}
/**
 * Updates the element's childNodes to match the items.
 * Performance is important.
 * 
 * @param {DOMElement} e - The DOM element to patch.
 * @param {Array} items - Array of items which will be passed as props.
 * @param {View} parent - The parent view.
 */

SequentialCache.prototype.patch = function (e, items, parent) {
  var pool = this._p;
  var viewClass = this._v;
  var childNodes = e.childNodes;
  var itemsLength = items.length;
  var item,
      view,
      poolCount = pool.length,
      childElementCount = this._c;

  for (var i = 0; i < itemsLength; i++) {
    item = items[i];

    if (i < poolCount) {
      view = pool[i];
      view.setProps(item);
    } else {
      view = createView(viewClass, parent, item);
      pool.push(view);
      poolCount++;
    }

    if (i >= childElementCount) {
      e.appendChild(view.e);
    }
  }

  this._c = itemsLength;
  trimChildren(e, childNodes, itemsLength);
};
/**
 * An object which creates and caches views according to the mappings provided.
 * If there is no match in the mappings, the fallback function is called.
 * 
 * Note that the fallback must return an instance (of View or Wrapper) whereas
 * mappings must specify view classes. 
 * 
 * You can rely solely on the fallback if you like.
 * 
 * @param {Object} mappings - a mapping of format key->viewClass
 * @param {function} fallback - a function to call when no key is provided.
 * 
 */


function InstanceCache(mappings, fallback) {
  this._m = mappings;
  this._f = fallback;
  this._i = {}; // Instances
}

InstanceCache.prototype.getOne = function (key, parentView) {
  if (!this._i.hasOwnProperty(key)) {
    this._i[key] = this._m.hasOwnProperty(key) ? parentView.nest(this._m[key]) : this._f(key, parentView);
  }

  return this._i[key];
};
/**
 * Trims the unwanted child elements from the end.
 * 
 * @param {Node} e 
 * @param {Array} childNodes 
 * @param {Int} itemsLength 
 */


function trimChildren(e, childNodes, itemsLength) {
  var lastIndex = childNodes.length - 1;
  var keepIndex = itemsLength - 1;

  for (var i = lastIndex; i > keepIndex; i--) {
    e.removeChild(childNodes[i]);
  }
}
/**
 * Pulls an item forward in an array, to replicate insertBefore.
 * @param {Array} arr 
 * @param {any} item 
 * @param {Int} to 
 */


function pull(arr, item, to) {
  var position = arr.indexOf(item);

  if (position != to) {
    arr.splice(to, 0, arr.splice(position, 1)[0]);
  }
}

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
 * An object which caches the results of lookup queries so we don't have to
 * repeat them in the same view.
 * The Lookup instance will be shared between instances of a view.
 * Must call reset() on every update.
 */
function Lookup(callbacks) {
  this.callbacks = callbacks;
  this.run = {};
}
Lookup.prototype = {
  get: function get(view, key) {
    var run = this.run;

    if (run[key] === undefined) {
      // Verbose but efficient way as it avoids lookups?
      // Or is this harmful to performance because we're just reading values more than calling functions?
      var o = view.__ov[key];
      var n = this.callbacks[key](view, view.props);
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
  },
  reset: function reset() {
    this.run = {};
  }
};

/**
 * Represents a view.
 */

function View(parent) {
  var s = this;
  s.parent = parent; // The parent view

  s.props = undefined; // The props passed to the view. May be changed.
  // These will be set during build

  s.e = null; // the element

  s.el = null; // the named wrappers
  // Internal state objects

  s.__nv = []; // Nested views

  s.__ov = {}; // The old values for watches to compare against
}
var proto$1 = View.prototype;
/**
 * Gets called once immediately after building.
 * Sets initial props extracted from __html__.
 */

proto$1.init = function () {
  for (var key in this.__ip) {
    var callback = this.__ip[key];
    var nestedComponent = this.el[key];
    nestedComponent.props = callback(this, this.props);
    nestedComponent.init();
  }
};
/**
 * Calls a function somewhere up the parent tree.
 */


proto$1.bubble = function (name) {
  var target = this.parent;

  while (!und(target)) {
    if (target[name]) {
      // We don't really care about performance here, so accessing arguments is fine.   
      return target[name].apply(target, Array.prototype.slice.call(arguments, 1));
    }

    target = target.parent;
  }

  throw 'Bubble popped.';
};
/**
 * Move the view to new parent. Necessary if sharing a cache.
 */


proto$1.move = function (newParent) {
  if (this.parent && this.parent.__nv) {
    var nv = this.parent.__nv;
    nv.splice(nv.indexOf(this), 1);
  }

  this.parent = newParent;
};
/**
 * Builds a nested view of the specified class. Its up to you how you use it.
 */


proto$1.nest = function (cls, props) {
  var child = createView(cls, this, props || this.props);

  this.__nv.push(child);

  return child;
};
/**
 * Lookup a watched value during update. Returns an object with {o, n, c}
 * (oldValue, newValue, changed).
 * You must call this.resetLookups before calling this during an update.
 * The point is to cache the result so it doesn't have to be repeated.
 */


proto$1.lookup = function (query) {
  return this.__qc.get(this, query);
};
/**
 * Resets the lookups, must be called before calling this.lookup() during an update.
 */


proto$1.resetLookups = function () {
  this.__qc.reset();
};
/**
 * Sets the props and updates the view.
 */


proto$1.setProps = function (props) {
  this.props = props;
  this.update();
  return this;
};
/**
 * Call this if you want to get mount() and unmount() callbacks.
 */


proto$1.trackMounting = function () {
  this.__mt.track(this);
};
/**
 * Updates the view.
 */


proto$1.update = function () {
  this.resetLookups();
  this.updateSelf();
  this.updateNested();
};
/**
 * Loops over watches skipping shielded watches if elements are hidden.
 */


proto$1.updateSelf = function () {
  var i = 0,
      watch,
      wrapper,
      shieldCount,
      shieldQuery,
      shieldQueryResult,
      shouldBeVisible;
  var watches = this.__wc;
  var il = watches.length;

  while (i < il) {
    watch = watches[i];
    wrapper = this.el[watch.wk];
    shieldQuery = watch.sq;
    i++;
    shouldBeVisible = true;

    if (shieldQuery) {
      // Get the newValue for shieldQuery using lookup
      shieldQueryResult = this.lookup(shieldQuery).n; // Determine if shouldBeVisible based on reverseShield
      // i.e. whether "shieldQuery===true" means show or hide.

      shouldBeVisible = watch.rv ? shieldQueryResult : !shieldQueryResult; // The number of watches to skip if this element is not visible

      shieldCount = shouldBeVisible ? 0 : watch.sc; // Set the element visibility

      wrapper.visible(shouldBeVisible);
      i += shieldCount;
    }

    if (shouldBeVisible) {
      applyWatchCallbacks(this, wrapper, watch.cb);
    }
  }
};
/**
 * Update nested views (but not repeat elements).
 */


proto$1.updateNested = function () {
  // These are user created by calling nest()
  var items = this.__nv;

  for (var i = 0, il = items.length; i < il; i++) {
    var child = items[i];

    if (child.__ia()) {
      child.update();
    }
  } // These are created with directives, and whose props arguments may need reprocessed.


  for (var key in this.__ip) {
    var callback = this.__ip[key];
    var nestedComponent = this.el[key];
    nestedComponent.setProps(callback(this, this.props));
  }
};
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
 * Creates a watch.
 */


proto$1.__wa = function (wrapperKey, shieldQuery, reverseShield, shieldCount, callbacks) {
  return {
    wk: wrapperKey,
    // The key of the corresponding wrapper.
    sq: shieldQuery,
    // The shield query key
    rv: reverseShield,
    // whether shieldQuery should be flipped
    sc: shieldCount,
    // The number of items to shield
    cb: callbacks // The callbacks - object

  };
};

var applyWatchCallbacks = function applyWatchCallbacks(view, wrapper, callbacks) {
  for (var key in callbacks) {
    var callback = callbacks[key];

    if (key === '*') {
      callback.call(view, wrapper, view.props, view);
    } else {
      // means: {new, old, changed}
      var _view$lookup = view.lookup(key),
          n = _view$lookup.n,
          o = _view$lookup.o,
          c = _view$lookup.c;

      if (c) {
        callback.call(view, n, o, wrapper, view.props, view);
      }
    }
  }
};
/**
 * The global mount tracker.
 */


proto$1.__mt = mountie;
/**
 * Nest Internal. For building a nested view declared in the html.
 */

proto$1.__ni = function (path, cls) {
  var child = buildView(cls, this);

  this.__gw(path).replace(child.e);

  return child;
};
/**
 * 
 * @param {function} baseClass - the base class to extend from
 * @param {object} [prototypeExtras] - an object with extra things to be added to the prototype
 * @param {function} [prototypeExtras] - the function to be used as constructor
 */


View.prototype.__ex = function (baseClass, prototypeExtras, constructorFunction) {
  var subClass = constructorFunction || function (parent) {
    baseClass.apply(this, parent);
  };

  subClass.prototype = Object.create(baseClass && baseClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  Object.setPrototypeOf(subClass, baseClass);

  if (prototypeExtras) {
    Object.assign(subClass.prototype, prototypeExtras);
  }

  return subClass;
};
/**
 * Create caches.
 */


proto$1.__kc = function (cls, keyFn) {
  return new KeyedCache(cls, keyFn);
};

proto$1.__sc = function (cls) {
  return new SequentialCache(cls);
};

proto$1.__ic = function (mappings, fallback) {
  return new InstanceCache(mappings, fallback);
};
/**
 * Build the DOM. We pass prototype as local var for compactness.
 */


proto$1.__bd = function (prototype) {
  if (prototype.__cn === undefined) {
    prototype.__cn = makeEl(prototype.__ht);
  }

  this.e = prototype.__cn.cloneNode(true);
}; // proto.__bd = function(prototype, clone) {
//   if (clone && !prototype.__cn) {
//     prototype.__cn = makeEl(prototype.__ht)
//   }
//   this.e = clone ? prototype.__cn.cloneNode(true) : makeEl(prototype.__ht)
// }
// proto.__bd = function(prototype) {
//   this.e = makeEl(prototype.__ht)
// }

/**
 * Returns a regular wrapper around element at path, where path is an array of indices.
 * This is used by the babel plugin.
 */


proto$1.__gw = function (path) {
  return new Wrapper(this.__fe(path));
};
/**
 * Finds an element at specified path, where path is an array of indices.
 * This is used by the babel plugin.
 */


proto$1.__fe = function (path) {
  return path.reduce(function (acc, index) {
    return acc.childNodes[index];
  }, this.e);
};
/**
 * Is Attached.
 * Determines whether this view is attached to the DOM.
 */


proto$1.__ia = function () {
  var e = this.e;

  while (e) {
    if (e === document) {
      return true;
    }

    e = e.parentNode;
  }

  return false;
};
/**
 * Creates a lookup.
 */


proto$1.__lu = function (callbacks) {
  return new Lookup(callbacks);
};
/**
 * Creates an anonymous stub view class
 */


proto$1.__sv = function () {
  var cls = function cls(parent) {
    View.call(this, parent);
  };

  cls.prototype = new View();
  return cls;
};
/**
 * Toggles visibility, like wrapper.
 */


proto$1.visible = function (visible) {
  this.e.classList.toggle('hidden', !visible);
};

module.exports = {
  createView: createView,
  h: h,
  mount: mount,
  KeyedCache: KeyedCache,
  InstanceCache: InstanceCache,
  isStr: isStr,
  SequentialCache: SequentialCache,
  View: View,
  Wrapper: Wrapper
};
