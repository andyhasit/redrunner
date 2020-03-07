import {h, getProp, Wrapper, und} from './utils'


export function createComponent(componentClass, app, parent, obj, seq) {
  let component = new componentClass(app, parent, obj, seq)
  //(app, box, bubble, el, s, seq, watch)
  //v.init(v.app, v.box.bind(v), v.bubble.bind(v), v.el.bind(v), v, v.seq, v.watch.bind(v))
  // TODO restore the above
  // could even create the literal object here..?
  component.build()
  component.init()
  return component
}


export class Component {
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
  }
  _lookup_(path) {
    return new Wrapper(path.reduce((acc, index) => {
      return acc.childNodes[index]
    }, this.root.e), this)
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
      newValue = getProp(this, path)
      previousValue = this._previous_[path]
      if (path === '' || previousValue !== newValue) {
        for (var i=0, il=callbacks.length; i<il; i++) {
          callbacks[i](newValue, previousValue)
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
     * Builds a nested view of the specified class.
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



export class ComponentOld {

  

  static _ii_ = false // is initialised
  static _initialise_(type) {
    if (type._ii_) {
      return
    }
    type.setup(type._build_.bind(type), type._bind_.bind(type), type._watch_.bind(type))
    type._ii_ = true
  }

  /*
   * Builds the HTML skeleton 
   */
  static _domdef_ = null
  static _build_(desc, inner) {

    this._domdef_ = h(desc, inner)
  }
  static _bind_(definitions) {

  }
  static _watch_(definitions) {

  }

  walk(nodeDef, parentNode) {
    let element, wrapperOrComponent
    if (isStr(nodeDef)) {
      element = doc.createTextNode(nodeDef)
    } else {
      // We know is nodeDef in a object containing a component or a native element
      let label = nodeDef.l
      if (nodeDef.c) {
        wrapperOrComponent = nodeDef.c
        element = wrapperOrComponent.root
      } else {
        element = nodeDef.e
        inner.forEach(def => this.walk(def, element))
      }
      if (label) {
        this.saveElement(
          label, 
          wrapperOrComponent? wrapperOrComponent : new Wrapper(element, this)
        )
      }
    }
    if (parentNode) {
      parentNode.appendChild(element)
    }
  }

  constructor(app, parent, obj, seq) {
    let s = this
    let type = s.constructor
    type._initialise_(type)

    s.app = app             // Reference to the containing app. This is static
    s.parent = parent       // The parent view
    s.o = obj               // The object passed to the view. May be changed
    s.seq = seq             // The sequence - only for nested views

    // Internal state objects
    s._nested_ = []         // Array of arrays of nested views
    s._previous_ = {}       // The previous values for watches to compare against    
    
    s.root = s._buildComponent_()
  }
  

  
  // _createPathFn_(path) {
  //   let intString = path.replace(/^\D+/g, '')
  //   let elementType = path.replace(/\d+$/, "")
  //   let index = intString == ''? 0 : parseInt(intString)
  //   return rootElement => rootElement.getElementsByTagName(elementType)[index]
  // }
  
  // _findEl_(path) {
  //   if (path == '') {`
  //     return new Wrapper(this.root, this)
  //   }
  //   let paths = this._ct_._pathFns_
  //   if (!(path in paths)) {
  //     paths[path] = this._createPathFn_(path)
  //   }
  //   let v = paths[path](this.root)
  //   // if (und(v)) {
  //   //   throw `Component ${this._ct_.name} could not find element at "${path}"`
  //   // }
  //   return new Wrapper(v, this)
  // }
  
  // constructor(app, parent, obj, seq) {
  //   let s = this
  //   s._ct_ = s.constructor
  //   s.app = app             // Reference to the containing app. This is static
  //   s.parent = parent       // The parent view
  //   s.o = obj               // The object passed to the view. May be changed
  //   s.seq = seq             // The sequence - only for nested views
    
  //   // Create the root element by cloning from the template node
  //   s.root = s._cloneNode_()

  //   // Internal state objects
  //   s._nested_ = []         // Array of arrays of nested views
  //   s._always_ = []         // Callbacks that should always by run during update
  //   s._watches_ = {}        // Watches
  //   s._previous_ = {}       // The previous values for watches to compare against
  // }
  el(path) {
    let element
    if (path == '') {
      element = this.root
    } else {
      let pathChunks = this.app._getPathChunks_(path)
      element = this.root.getElementsByTagName(pathChunks[0])[pathChunks[1]]
    }
    return new Wrapper(element, this)
  }


  // h(desc, atts, inner) {
  //   /*
  //    * Returns a new Wrapper around a new DOM element.
  //    * @param {str} desc -- string representing an element type. e.g. 'div'. Any additional
  //    * words are used as cls e.g. 'i far fa-bell' becomes <i class="far fa-bell">
  //    * @param {Component} view -- optional the view which the 
  //   */
  //   // TODO: check performance on all this. Too much time splitting strings/array 
  //   // or should I only wrap at end?
  //   let tag, cls, w
  //   if (und(inner)) {
  //     inner = atts
  //     atts = {}
  //   }
  //   [tag, ...cls] = desc.trim().split(' ')
  //   w = new Wrapper(doc.createElement(tag), this)
  //   cls.forEach(i => i.startsWith('#') ? w.att('id', i.slice(1)) : w.clsAdd(i)) 
  //   return w.atts(atts).inner(inner)
  // }



}
