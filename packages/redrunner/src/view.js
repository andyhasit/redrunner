import {KeyedCache, SequentialCache} from './viewcache'
import {buildView, createView} from  './utils'
import {und, makeEl} from './helpers'
import mountie from './mountie'
import {Wrapper} from './wrapper'
import {Watch} from './watch'
import {Lookup} from './lookup'


/**
 * Represents a view.
 */
export class View {
  constructor(parent) {
    const s = this
    s.parent = parent       // The parent view
    s.props = undefined     // The props passed to the view. May be changed.

    // These will be set during build
    s.e = null              // the element
    s.dom = null            // the named wrappers

    // Internal state objects
    s.__nv = []             // Nested views
    s.__ov = {}             // The old values for watches to compare against
  }
  /**
   * Gets called once immediately after building.
   * Sets initial props extracted from __html__.
   */
  init() {
    for (const [k, v] of Object.entries(this.__ip)) {
      let view = this.dom[k]
      view.props = v.apply(this)
      view.init()
    }
  }
  /**
   * Was intended as a way to bubble events up the tree. Not sure if needed.
   */
  emit(name, args) {
    let target = this
    while (!und(target)) {
      let handlers = target._handlers_
      if (name in handlers) {
        return handlers[name].apply(target, args)
      }
      target = target.parent
    }
  }
  /**
   * Move the view to new parent. Necessary if sharing a cache.
   */
  move(newParent) {
    if (this.parent && this.parent.__nv) {
      const nv = this.parent.__nv
      nv.splice(nv.indexOf(this), 1)
    }
    this.parent = newParent
  }
  /**
   * Builds a nested view of the specified class. Its up to you how you use it.
   */
  nest(cls, props) {
    const child = createView(cls, this, props)
    this.__nv.push(child)
    return child
  }
  /**
   * Lookup a watched value during update. Returns an object with {o, n, c}
   * (oldValue, newValue, changed).
   * You must call this.resetLookups before calling this during an update.
   * The point is to cache the result so it doesn't have to be repeated.
   */
  lookup(query) {
    return this.__qc.get(this, query)
  }
  /**
   * Resets the lookups, muct be called before calling this.lookup() during an update.
   */
  resetLookups() {
    this.__qc.reset()
  }
  /**
   * Sets the props and updates the view.
   */
  setProps(props) {
    this.props = props
    this.update()
    return this
  }
  /**
   * Call this if you want to get mount() and unmount() callbacks.
   */
  trackMounting() {
    this.__mt.track(this)
  }
  /**
   * Updates the view.
   */
  update() {
    this.resetLookups()
    this.updateSelf()
    this.updateNested()
  }
  /**
   * Loops over watches skipping shielded watches if elements are hidden.
   */
  updateSelf() {
    let i = 0, watch, shieldCount, shieldQueryResult, shouldBeVisible
    const watches = this.__wc
    if (!watches) {
      return
    }
    const il = watches.length
    //c.log(watches)
    while (i < il) {
      watch = watches[i]
      i ++
      shouldBeVisible = true
      if (watch.sq) {
        // Get the newValue for shieldQuery using lookup
        shieldQueryResult = this.lookup(watch.sq).n

        // Determine if shouldBeVisible based on reverseShield
        // i.e. whether "shieldQuery==true" means show or hide.
        shouldBeVisible = watch.rv ? shieldQueryResult : !shieldQueryResult

        // The number of watches to skip if this element is not visible
        shieldCount = shouldBeVisible ? 0 : watch.sc

        // Set the element visibility
        this.dom[watch.wk].visible(shouldBeVisible)
        i += shieldCount
      }
      if (shouldBeVisible) {
        watch.go(this)
      }
    }
  }
  /**
   * Update nested views (but not repeat elements).
   */
  updateNested() {
    // These are user created by calling next()
    const items = this.__nv
    for (const i=0, il=items.length; i<il; i++) {
      let child = items[i]
      if (child.__ia()) {
        child.update()
      }
    }
    // These are created with directives, and whose props arguments may need reprocessed.
    // TODO improve this, maybe drop for of
    for (const [k, v] of Object.entries(this.__ip)) {
      let view = this.dom[k]
      view.setProps(v.apply(this))
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
}

var proto = View.prototype

/**
 * The global mount tracker.
 */
proto.__mt = mountie

/**
 * Nest Internal. For building a nested view declared in the html.
 */
proto.__ni = function(path, cls) {
  const child = buildView(cls, this)
  this.__gw(path).replace(child.e)
  return child
}

/**
 * Create caches.
 */
proto.__kc = function(cls, keyFn) {
  return new KeyedCache(cls, keyFn)
}
proto.__sc = function(cls) {
  return new SequentialCache(cls)
}

/**
 * Build the DOM. We pass prototype as local var for speed.
 */
proto.__bd = function(prototype, clone) {
  if (clone && !prototype.__cn) {
    prototype.__cn = makeEl(prototype.__ht)
  }
  this.e = clone ? prototype.__cn.cloneNode(true) : makeEl(prototype.__ht)
}

/**
 * Returns a regular wrapper around element at path, where path is an array of indices.
 * This is used by the babel plugin.
 */
proto.__gw =  function(path) {
  return new Wrapper(this.__fe(path))
}

/**
 * Finds an element at specified path, where path is an array of indices.
 * This is used by the babel plugin.
 */
proto.__fe = function(path) {
  return path.reduce((acc, index) => acc.childNodes[index], this.e)
}

/**
 * Is Attached.
 * Determines whether this view is attached to the DOM.
 */
proto.__ia = function() {
  let e = this.e
  while (e) {
    if (e === document) {
      return true
    }
    e = e.parentNode
  }
  return false
}

/**
 * Creates a watch.
 */
proto.__wa = function(el, shieldQuery, reverseShield, shieldCount, callbacks) {
  return new Watch(el, shieldQuery, reverseShield, shieldCount, callbacks)
}

/**
 * Creates a lookup.
 */
proto.__lu = function(callbacks) {
  return new Lookup(callbacks)
}


/**
 * Creates an anonymous view class for stubs.
 */
proto.__av = function() {
  const cls = function(parent) {
    View.apply(this, parent)
  }
  cls.prototype = new View()
  return cls
}

