import {h, createComponent, getProp, und, wrap, Wrapper} from './utils'


export class Component {
  __html__ = '<div/>'
  constructor(app, parent, obj, seq) {
    let s = this

    s.app = app             // Reference to the containing app. This is static
    s.parent = parent       // The parent view
    s.o = obj               // The object passed to the view. May be changed
    s.seq = seq             // The sequence - only for nested views
    // Internal state objects
    s._nested_ = []         // Array of arrays of nested views
    s._previous_ = {}       // The previous values for watches to compare against  

    // These will be set by _build_()
    s.root = null           // the root wrapper, will be set by _build_
    s._elements_ = null     // the named wrappers, will be set by _build_
    s._watches_ = s.constructor._watches_
  }
  init() {} // probably overriden
  update(newObj) {
    /*  
     *   The external call to update the view. 
     *   @newObj -- new object, else it keeps its old (which is fine)
     */
    if (newObj) {
      this.o = newObj
    }
    this._updateWatches_()
    this._updateNested_()
  }
  debug() {
    console.log(this._build_.toString())
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
    if (!this._watches_.hasOwnProperty(path)) {
      this._watches_[path] = []
    }
    this._watches_[path].push(callback)
    return this // Keep this because people may use it like on the wrapper.
  }
  _lu_(path) {
    /*
    Returns a wrapper around element at path, where path is an array of indices.
    This is used by the babel plugin.
    */
    let el = path.reduce((accumulator, index) => accumulator.childNodes[index], this.root.e)
    return new Wrapper(el, this)
  }
  _updateNested_() {
    this._nested_.forEach(child => {
      if (child._attached_()) {
         child.update()
      }
    })
  }
  _updateWatches_() {
    /*
     * Iterates through watches. If the value has changed, call callback.
     */
    let path, newValue, previousValue, callbacks
    for (path in this._watches_) {
      callbacks = this._watches_[path]
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
  _attached_() {
    let el = this
    // TODO: loop until parent or app
    // let element = 
    // while (element != document && element.parentNode) {
    //   /* jump to the parent element */
    //   element = element.parentNode;
    // }
    return el.root.e.parentNode
  }
  box(componentClass, obj) {
    /*
     * Builds a nested view of the specified class. Its up to you how you attach it.
     * No caching is used. Use a cache object returned by this.cache() if you need caching.
     */
    let child = createComponent(componentClass, this.app, this, obj, 0)
    this._nested_.push(child)
    return child
  }




  _cloneNode_() {
    let ct = this._ct_
    if (!ct._template_) {
      let throwAway = document.createElement('template')
      // let tidy = raw.replace(/\n/g, "")
      //   .replace(/[\t ]+\</g, "<")
      //   .replace(/\>[\t ]+\</g, "><")
      //   .replace(/\>[\t ]+$/g, ">")
      throwAway.innerHTML = ct.html.trim()
      ct._template_ = throwAway.content.firstChild
    }
    return ct._template_.cloneNode(true)
  }
}