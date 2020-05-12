

export class ComponentOld {

  

  static _ii_ = false // is initialised
  static _initialise_(type) {
    if (type._ii_) {
      return
    }
    type.setup(type.__build.bind(type), type._bind_.bind(type), type._watch_.bind(type))
    type._ii_ = true
  }

  /*
   * Builds the HTML skeleton 
   */
  static _domdef_ = null
  static __build(desc, inner) {

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
