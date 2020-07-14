const c = console;
import {KeyedCache, SequentialCache} from './viewcache'
import {buildView, createView} from  './utils'
import {und, makeEl} from './helpers'
import mountie from './mountie'
import {Wrapper} from './wrapper'
import {Watch} from './watch'
import {QueryCollection} from './querycollection'


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
export class View {
  constructor(parent) {
    let s = this
    s.parent = parent       // The parent view
    s.props = undefined     // The props passed to the view. May be changed.
    // Internal state objects
    s.__nv = []             // Array of nested views

    // These relate to watchers
    s.__ov = {}             // The old values for watches to compare against

    // These will be set during build
    s.e = null              // the element
    s.dom = null            // the named wrappers
  }
  /**
   * Gets called once immediately after building.
   */
  init() {
    for (let [k, v] of Object.entries(this.__ip)) {
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
   * Move the view to new parent.
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
    let child = createView(cls, this, props)
    this.__nv.push(child)
    return child
  }
  /**
   * Sets the props and updates the view.
   * @props -- new props, else it keeps its old (which is fine)
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
   * UpdateWatches.
   *
   * Calls update on all watches if watched value has changed, skipping shielded watches.
   */

  resetLookups() {
    this.__qc.reset()
  }
  lookup(query) {
    return this.__qc.get(this, query)
  }
  updateSelf() {
    let i = 0, watch, shield
    const watches = this.__wc
    if (!watches) {
      return
    }
    const il = watches.length

    while (i < il) {
      watch = watches[i]
      shield = watch.shieldFor(this)

      console.log(shield)
      if (shield) {
        i += shield
        continue
      }
      watch.appyCallbacks(this)
      i ++
    }
  }
  /**
   * Update nested views (but not repeat elements).
   */
  updateNested() {
    // These are user created by calling next()
    const items = this.__nv
    for (let i=0, il=items.length; i<il; i++) {
      let child = items[i]
      if (child.__ia()) {
        child.update()
      }
    }
    // These are created with directives, and whose props arguments may need reprocessed.
    for (let [k, v] of Object.entries(this.__ip)) {
      let view = this.dom[k]
      view.setProps(v.apply(this))
    }
  }

  /**
   * Returns the old value of a watch. Must use shorthand notation e.g. "..items"
   */
  // old(name) {
  //   return this.__ov[name]
  // }
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
  __bd(prototype, clone) {
    if (clone && !prototype.__cn) {
      prototype.__cn = makeEl(prototype.__ht)
    }
    this.e = clone ? prototype.__cn.cloneNode(true) : makeEl(prototype.__ht)
  }
  /**
   * Returns a regular wrapper around element at path, where path is an array of indices.
   * This is used by the babel plugin.
   */
  __gw(path) {
    return new Wrapper(this.__lu(path))
  }
  /**
   * Returns an element at specified path, where path is an array of indices.
   * This is used by the babel plugin.
   */
  __lu(path) {
    return path.reduce((acc, index) => acc.childNodes[index], this.e)
  }
  /**
   * Is Attached.
   * Determines whether this view is attached to the DOM.
   */
  __ia() {
    let e = this.e
    while (e) {
      if (e === document) {
        return true
      }
      e = e.parentNode
    }
    return false
  }
  __kc(cls, keyFn) {
    return new KeyedCache(cls, keyFn)
  }
  /**
   * Replace node at path.
   */
  __rn(path, view) {
    this.__gw(path).replace(view.e)
  }
  __sc(cls) {
    return new SequentialCache(cls)
  }
  /**
   * Nest Internal. For building a nested view declare in the html
   */
  __ni(path, cls) {
    const child = buildView(cls, this)
    this.__gw(path).replace(child.e)
    return child
  }
}

/**
 * The global mount tracker.
 */
View.prototype.__mt = mountie

/**
 * Build utils used by the generated code.
 */
View.prototype.__bu = {
  _wt: function(el, shieldQuery, reverseShield, shieldCount, callbacks) {
    return new Watch(el, shieldQuery, reverseShield, shieldCount, callbacks)
  },
  _qc: function(callbacks) {
    return new QueryCollection(callbacks)
  }
}
