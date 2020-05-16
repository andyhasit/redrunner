import {
  createView, 
  getProp, 
  und, 
  wrap, // Keep this, its used by babel
  Wrapper
} from './utils'

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
 *  __ia (IsAttached)
 *  __gw (GetWrapper) -- returns a wrapper at a specific path
 *  __nv (NestedViews)
 *  __pv (PreviousValues)
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
    s.__nv = []         // Array of arrays of nested views

    // These relate to watchers
    s._previous_ = {}       // The previous values for watches to compare against  

    // These will be set by __bv()
    s.root = null           // the root wrapper, will be set by __bv
    s.dom = null            // the named wrappers, will be set by __bv
  }

  /* This field gets transformed by the babel plugin.
   * Providing a default here so that child classes get processed.
   */
  __html__ = '<div/>'

  init() {
    // Gets called once
  }
  update(props) {
    /*  
     *   The external call to update the view. 
     *   @props -- new props, else it keeps its old (which is fine)
     */
    if (!und(props)) {
      this.props = props
    }
    this.__uw()
    this.__un()
  }
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
  nest(cls, props) {
    /*
     * Builds a nested view of the specified class. Its up to you how you attach it.
     * No caching is used. Use a cache object returned by this.cache() if you need caching.
     */
    let child = createView(cls, this, props, 0)
    this.__nv.push(child)
    return child
  }
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
  watch(path, callback) {
    /*
    Watch a property and call the callback during update if it has changed.

    @path -- A dotted path to the value

      e.g. 'user.id'
    
    @callback -- a function to be called with (newValue, oldValue)
    
      e.g. (n,o) => alert(`Value changed from ${o} to ${n}`)

    */
    if (!this._watch_.hasOwnProperty(path)) {
      this._watch_[path] = []
    }
    this._watch_[path].push(callback)
    return this // Keep this because people may use it like on the wrapper.
  }
  __gw(path) {
    /*
    Returns a wrapper around element at path, where path is an array of indices.
    This is used by the babel plugin.
    */
    let el = path.reduce((accumulator, index) => accumulator.childNodes[index], this.root.e)
    return new Wrapper(el, this)
  }
  __un() {
    this.__nv.forEach(child => {
      if (child.__ia()) {
         child.update()
      }
    })
  }
  __uw() {
    /*
     * Iterates through watches. If the value has changed, call callback.
     */
    let path, newValue, previousValue, callbacks
    for (path in this._watch_) {
      callbacks = this._watch_[path]
      c.log(callbacks)
      newValue = getProp(this, path)
      previousValue = this._previous_[path]
      if (path === '' || previousValue !== newValue) {
        for (var i=0, il=callbacks.length; i<il; i++) {
          c.log(callbacks[i])
          callbacks[i].apply(this, [newValue, previousValue])
        }
      }
      this._previous_[path] = newValue
    }
  }
  __rn(path, view) {
    this.__gw(path).replace(view.root.e)
  }
  __ia() {
    let el = this
    // TODO: loop until parent
    // let element = 
    // while (element != document && element.parentNode) {
    //   /* jump to the parent element */
    //   element = element.parentNode;
    // }
    return el.root.e.parentNode
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
}