import {KeyedCache, SequentialCache} from './view-cache'
import {createView} from  './utils'
import {und, makeEl} from './helpers'
import {CachedWrapper, Wrapper} from './wrapper'

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
   * This field gets transformed by the babel plugin.
   * Providing a default here so that child classes get processed.
   */
  __html__ = '<div/>'
  /**
   * Gets called once immediately after building.
   */
  init() {
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
   * Prints debug information. Maybe think of a better way of displaying this.
   */
  debug() {
    c.log(this.__bv.toString())
    let lines = []
    lines.push('__wc: {')
    for (let [name, callbacks] of Object.entries(this.__wc)) {
      lines.push(`  "${name}": [`)
      callbacks.forEach(e => lines.push('  ' + e.toString()))
      lines.push('  ]')
    }
    lines.push('}')
    c.log(lines.join('\n'))
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
    this. e = clone ? prototype.__cn.cloneNode(true) : makeEl(prototype.__ht)
  }
  /**
   * Returns a refular wrapper around element at path, where path is an array of indices.
   * This is used by the babel plugin.
   */
  __gw(path) {
    return new Wrapper(this.__lu(path))
  }
  /**
   * Returns a cached wrapper around element at path, where path is an array of indices.
   * This is used by the babel plugin.
   */
  __cw(path, cache, config) {
    return new CachedWrapper(this.__lu(path), cache, config)
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
   *
   * Note: currently unreliable as the view could be attached to an element which is itself detached.
   */
  __ia() {
    let el = this
    // let element =
    // while (element != document && element.parentNode) {
    //   /* jump to the parent element */
    //   element = element.parentNode;
    // }
    return el.e.parentNode
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
    let i = 0, newValue, oldValue, hasChanged, wrapper, shield, callbacks
    const watchCallbacks = this.__wc
    if (!watchCallbacks) {
      return
    }
    const il = watchCallbacks.length
    const queries = {}  // The saved results of queries. Should we optimize this?

    while (i < il) {
      let {wrapper, shield, callbacks} = watchCallbacks[i]
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
      i = (shield && wrapper.__shield) ? i + shield + 1 : i + 1
    }
  }
  __rn(path, view) {
    this.__gw(path).replace(view.e)
  }
}
