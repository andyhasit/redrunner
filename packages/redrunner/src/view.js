import {KeyedCache, SequentialCache} from './viewcache'
import {createView} from  './utils'
import {und, makeEl} from './helpers'
import mountie from './mountie'
import {Wrapper} from './wrapper'
import {Watch} from './watch'
import {QueryCollection} from './querycollection'


const c = console;
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
export class View {
  constructor(parent, props, seq) {
    let s = this
    s.parent = parent       // The parent view
    s.props = props         // The props passed to the view. May be changed
    s.seq = seq             // The sequence - only for nested views
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
  }
  trackMounting() {
    this.__mt.track(this)
  }
  /**
   *   The external call to update the view.
   *   @props -- new props, else it keeps its old (which is fine)
   */
  update(props) {
    if (!und(props)) {
      this.props = props
    }
    this.__uw()
    this.__un()
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
  nest(cls, props, seq) {
    let child = createView(cls, props, this, seq)
    this.__nv.push(child)
    return child
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
   * Returns the old value of a watch. Must use shorthand notation e.g. "..items"
   */
  old(name) {
    return this.__ov[name]
  }
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
  __sc(cls) {
    return new SequentialCache(cls)
  }
  /**
   * Update nested views.
   */
  __un() {
    const items = this.__nv
    for (let i=0, il=items.length; i<il; i++) {
      let child = items[i]
      if (child.__ia()) {
        child.update()
      }
    }
  }
  /**
   * UpdateWatches.
   *
   * Calls update on all watches if watched value has changed, skipping shielded watches.
   */
  __uw() {
    let i = 0, watch, shield
    const watches = this.__wc
    if (!watches) {
      return
    }
    const il = watches.length
    const queryCollection = this.queryCollection
    queryCollection.reset()

    while (i < il) {
      watch = watches[i]
      shield = watch.shieldFor(this, watch, queryCollection)
      if (shield) {
        i += shield
        continue
      }
      watch.appyCallbacks(this, queryCollection)
      i ++
    }
  }
  /**
   * Replace node at path.
   */
  __rn(path, view) {
    this.__gw(path).replace(view.e)
  }
}

/**
 * This is used by the generated code.
 */
View.prototype.buildUtils = {
  getWatch: function(el, shieldQuery, reverseShield, callbacks) {
    return new Watch(el, shieldQuery, reverseShield, callbacks)
  },
  getQueryCollection: function(callbacks) {
    return new QueryCollection(callbacks)
  }
}

View.prototype.__mt = mountie