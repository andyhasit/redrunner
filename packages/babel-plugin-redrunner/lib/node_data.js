const {EOL, viewVar, watchArgs} = require('./utils/constants')

/**
 * A NodeData object is created for every HTML node with directives.
 * Its data will be used to generate statements on the component.
 * It exposes methods which enable directives to set that data.
 * It also contains the directive syntax rules (expansion etc...)
 */
class NodeData {
  constructor(node, asStub) {
    this.node = node
    this.asStub = asStub // whether the whole html declaration is a stub
    this.stubName = undefined // Whether this node should be a stub
    this.saveAs = undefined
    this.customWrapperClass = undefined
    this.customWrapperArgs = undefined
    this.props = undefined
    this.shieldQuery = undefined
    this.reverseShield = 0
    this.replaceWith = undefined
    this.chainedCalls = []
    this.watches = []
    this.beforeSave = []
    this.afterSave = []
  }
  /**
   * Creates a watch on this node.
   * 
   * @param {string} property -- watchedProperty
   * @param {function} converter -- valueTranformer
   * @param {string} targer -- the wrapperMethod 
   * @param {string} extraWrapperArgs -- extraWrapperArgsToWrapperMethod 
   */
  addWatch(property, converter, wrapperMethod, extraWrapperArgs) {
    this.watches.push({property, converter, wrapperMethod, extraWrapperArgs})
  }
  /**
   * Creates an event listener on this node.
   * 
   * @param {string} event 
   * @param {string} callbackStr 
   */
  addEventListener(event, callbackStr) {
    const callback = this.buildEventCallback(callbackStr)
    this.chainedCalls.push(`on('${event}', ${callback})`)
  }
  /**
   * Builds the callback function for an event listener.
   */
  buildEventCallback(statement) {
    let text = this.expandDots(statement.trim())
    // Cater for '?' ending
    text = text.endsWith('?') ? text.slice(0, -1) : text
    const extra = text.endsWith(')') ? '' : `(w, e, ${viewVar}.props, ${viewVar})`
    // Convert 'this' to viewVar because of binding
    text = text.startsWith('this.') ? viewVar + text.substr(4) : text
    const body = `${text}${extra}`
    return ['function(w, e) {', body, '}'].join(EOL)
  }
  /**
   * Builds the call to create a cache for child views.
   * 
   * @param {string} cacheDef - the name of the view class to cache, or if it
   * starts with @ then it is the path to a cache object (e.g. @..sharedCache ).
   * @param {string} cacheKey - the field on the props to cache by.
   */
  buildCacheInit (cacheDef, cacheKey){
    let cacheStatement
    if (cacheDef.startsWith('@')) {
      cacheStatement = this.parseWatchedValueSlot(cacheDef.substr(1))
    } else {
      if (cacheKey) {
        const keyFn = `function(props) {return props.${cacheKey}}`
        cacheStatement = `view.__kc(${cacheDef}, ${keyFn})`
      } else {
        cacheStatement = `view.__sc(${cacheDef})`
      }
    }
    return cacheStatement
  }
  /**
   * Returns the callback for the watch query, or undefined.
   * TODO: move
   */
  getWatchQueryCallBack(property) {
    if (property !== '*') {
      return (property === '' || property === undefined) ?
        `function() {return null}` :
        `function() {return ${this.parseWatchedValueSlot(property)}}`
    }
  }
  /**
   * Expands the converter slot.
   * Assumes it is a function, not a field.
   * If enclosed in bracket, treats as raw code.
   * 
   *   undefined  >  undefined
   *   ''         >  undefined
   *   foo        >  this.props.foo()
   *   foo!       >  this.props.foo
   *   foo?       >  this.props.foo(n, o)
   */
  expandConverter(convert) {
    if (convert && (convert !== '')) {

      // If it starts with () then we treat it as raw JavaScript code.
      if (convert.startsWith('(')) {
        if (convert.endsWith(')')) {
          return convert.substr(1, convert.length - 2)
        } else {
          throw 'Converter starting with "(" must also end with ")"'
        }
      }

      // Remove ? because it's just the user explicity marking this a function
      convert = convert.endsWith('?') ? convert.slice(0, -1) : convert
      // If ends with . then treat as field, else turn it into a call with the watch args
      convert = convert.endsWith('.') ? convert.slice(0, -1) : convert //`${convert}${watchArgs}`
      return this.expandDots(convert)
    }
  }
  /**
   * Expands a field's shorthand notation as follows:
   *
   *   field    >  this.props.field
   *   .field   >  this.field
   *   ..field  >  field
   */
  expandDots(field) {
    if (field.startsWith('..')) {
      return field.substr(2)
    } else if (field.startsWith('.')) {
      return this.asStub ? 'this.parent.' + field.substr(1) : 'this.' + field.substr(1)
    }
    return this.asStub ? 'this.parent.props.' + field : 'this.props.' + field
  }

  expandProps(field) {
    if (field.endsWith('?')) {
      field = field.slice(0, -1) + '(this)'
    }
    return this.expandDots(field)
  }

  /**
   * Expands the watched property slot, including the expandDots.
   * Assumes field not function.
   *
   *   undefined  >  undefined
   *   ''         >  undefined
   *   foo        >  this.props.foo
   *   foo!       >  this.props.foo
   *   foo?       >  this.props.foo(props, component)
   *   .foo       >  this.foo
   *   ..foo      >  foo
   *
   */
  parseWatchedValueSlot(property) {
    if (property === '*') {
      return '*'
    }
    if (property === '' || property === undefined) {
      return undefined
    }

    // Remove ! because it's just the user explicity marking this a field
    property = property.endsWith('!') ? property.slice(0, -1) : property

    const expanded = this.expandDots(property)
    return property.endsWith('?') ? expanded.slice(0, -1) + `(this.props, this)` : expanded
  }
}

module.exports = {NodeData}