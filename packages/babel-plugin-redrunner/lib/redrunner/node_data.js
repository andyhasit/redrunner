const {EOL, splitter, watchArgs} = require('../utils/constants')
const {extractAtts, isLeafNode, removeAtt} = require('../utils/dom')
const {clearIfEmpty, isFunc, isUnd, splitTrim} = require('../utils/misc')
const {config} = require('./config')

// Settings for inline directives
const [startDelimiter, endDelimiter] = config.options.inlineDelimiters
const delimiterLength = startDelimiter.length


/**
 * A NodeData object is created for every HTML node with directives.
 * Its data will be used to generate statements on the component.
 * It exposes many methods which enable directives to set that date.
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
   * Create a watch on this node.
   * 
   * @param {string} property -- watchedProperty
   * @param {function} converter -- valueTranformer
   * @param {string} targer -- the wrapperMethod 
   * @param {string} extraArgs -- extraArgsToWrapperMethod 
   */
  addWatch(property, converter, target, extraArgs) {
    this.watches.push({property, converter, target, extraArgs})
  }
  /**
   * Create an event listener on this node.
   * 
   * @param {string} event 
   * @param {string} callbackStr 
   */
  addEventListener(event, callbackStr) {
    const callback = this.buildEventCallback(callbackStr)
    this.chainedCalls.push(`on('${event}', ${callback})`)
  }
  /**
   * Used internally to 
   * 
   * @param {string} directiveName 
   * @param {*} directive 
   * @param {*} attVal 
   */

  processDirective(directiveName, directive, attVal) {
    if (!isFunc(directive.handle)) {
      throw new Error('handle must be a function')
    }
    let args = attVal
    if (directive.hasOwnProperty('params')) {
      let params = splitTrim(directive.params, ',')
      args = this.parseDirectiveArguments(params, attVal)
      directive.handle.apply(this, args)
    } else {
      directive.handle.apply(this, [args])
    }
  }

  /**
   * Return array of args based on definitions
   *
   * @param {Array} params The parameters as strings
   * @param {String} attVal The raw attribute value.
   */
  parseDirectiveArguments(params, attVal) {
    const args = []
    const chunks = splitTrim(attVal, '|')
    for (let i=0, il=params.length; i<il; i++) {
      let param = params[i]
      let raw = chunks[i]
      let value = this.parseArgValue(param, raw, i)
      args.push(value)
    }
    return args
  }
  parseArgValue(param, raw, i) {
    if ((!param.endsWith('?')) && (isUnd(raw))) {
      throw new Error(`Argument ${param} is required`)
    }
    return raw
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
   * Builds callback statement for a watch.
   * TODO: tidy this fucking mess...
   */
  buildWatchCallbackLine(saveAs, convert, target, raw, extraArgs) {
    let callbackBody, wrapper = `this.el.${saveAs}`
    let extraArg = `, ${extraArgs}`
    convert = convert ? this.expandConverter(convert) : ''
    if (target) {
      const targetString = this.parseWatchTargetSlot(target)
      if (raw) {
        callbackBody = `${wrapper}.${targetString}${raw})`
      } else if (convert) {
        callbackBody = `${wrapper}.${targetString}${convert}${extraArg})`
      } else {
        callbackBody = `${wrapper}.${targetString}n${extraArg})`
      }
    } else {
      // No watch target. Assume convert is provided.
      // But it needs messy adjusting...
      if (convert.endsWith(watchArgs)) {
        callbackBody = `${convert.slice(0, -1)}, ${wrapper})`
      } else if (convert.endsWith(')')) {
        callbackBody = `${convert}`
      } else {
        callbackBody = `${convert}${watchArgs.slice(0, -1)}, ${wrapper})`
      }
    }
    return callbackBody
  }

  /**
   * Builds the callback function for an event listener.
   */
  buildEventCallback(statement) {
    let text = this.expandPrefix(statement.trim())
    // Cater for '?' ending
    text = text.endsWith('?') ? text.slice(0, -1) : text
    const extra = text.endsWith(')') ? '' : '(e, w)'
    // Convert 'this' to 'view' because of binding
    text = text.startsWith('this.') ? 'view' + text.substr(4) : text
    const body = `${text}${extra}`
    return ['function(e, w) {', body, '}'].join(EOL)
  }

  /**
   * Returns the callback for the watch query, or undefined.
   */
  getWatchQueryCallBack(property) {
    if (property !== '*') {
      return (property === '' || property === undefined) ?
        `function() {return null}` :
        `function() {return ${this.parseWatchedValueSlot(property)}}`
    }
  }
  
  /**
   * Expands the convert slot, including the expandPrefix
   * Assumes function
   *
   *   undefined  >  undefined
   *   ''         >  undefined
   *   foo        >  this.props.foo()
   *   foo!       >  this.props.foo
   *   foo?       >  this.props.foo(n, o)
   *   foo(x, 2)  >  this.props.foo(x, 2)
   *
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
      
      // If it ends with ) then we treat it as raw function call.
      // e.g. foo(x, 2)
      if (convert.endsWith(')')) {
        return this.expandPrefix(convert)
      }

      // Remove ? because it's just the user explicity marking this a function
      convert = convert.endsWith('?') ? convert.slice(0, -1) : convert
      // If ends with . then treat as field, else turn it into a call with the watch args
      convert = convert.endsWith('.') ? convert.slice(0, -1) : `${convert}${watchArgs}`
      return this.expandPrefix(convert)
    }
  }

  /**
   * Expands a field's shorthand notation as follows:
   *
   *   field    >  this.props.field
   *   .field   >  this.field
   *   ..field  >  field
   * 
   */
  expandPrefix(field, convertToCall=false) {
    if (convertToCall && field.endsWith('?')) {
      field = field.slice(0, -1) + '(this.props, this)'
    }
    if (field.startsWith('..')) {
      return field.substr(2)
    } else if (field.startsWith('.')) {
      return this.asStub ? 'this.parent.' + field.substr(1) : 'this.' + field.substr(1)
    }
    return this.asStub ? 'this.parent.props.' + field : 'this.props.' + field
  }

  /**
   * Expands the watched property slot, including the expandPrefix.
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
    if (property == '*') {
      return '*'
    }
    if (property === '' || property === undefined) {
      return undefined
    }

    // Remove ! because it's just the user explicity marking this a field
    property = property.endsWith('!') ? property.slice(0, -1) : property

    const expanded = this.expandPrefix(property)
    return property.endsWith('?') ? expanded.slice(0, -1) + `(this.props, this)` : expanded
  }
  parseWatchTargetSlot(target) {
    if (target.startsWith('@')) {
      target = 'att:' + target.substr(1)
    }
    const [method, arg] = target.split(':')
    if (arg) {
      return `${method}('${arg}', `
    }
    return target + '('
  }

  /**
   * Builds the watch object.
   */
  buildInlineWatch(target, inlineCallDetails) {
    let raw
    let {property, convert, before, after} = inlineCallDetails
    /*
    before and after is any text found before or after the brackets.
    raw is the raw javascript code that will be generated.

    */
    convert = convert ? this.expandConverter(convert) : 'n'
    if (before && after) {
      raw = `"${before}" + ${convert} + "${after}"`
    } else if (before && !after) {
      raw = `"${before}" + ${convert}`
    } else if (!before && after) {
      raw = `${convert} + "${after}"`
    } else {
      raw = convert
    }
    return {property, raw, target}
  }

  /**
   * If an {{inline}} is found, returns an object with its details, else undefined.
   *
   * @return {object} As {name, convert, before, after}
   *
   * convert, before and after may be undefined. Before and after will be partially
   *     trimmed.
   *
   * Examples:
   *
   *  "{{style}}"                     >  {style, undefined, undefined, undefined}
   *  "my-style {{style}}"            >  {style, undefined, 'my-style ', undefined}
   *  "  my-style {{style}}   "       >  {style, undefined, 'my-style ', undefined}
   *  "my-style {{style|foo}} xyz  "  >  {style, foo, 'my-style ', ' xyz'}
   *
   */
  splitInlineText(rawStr) {
    const start = rawStr.indexOf(startDelimiter)
    let end = 0
    if (start >= 0) {
      end = rawStr.indexOf(endDelimiter)
      if (end > start) {
        const inline = rawStr.substring(start + delimiterLength, end)
        let before = clearIfEmpty(rawStr.substr(0, start).trimStart())
        let after = clearIfEmpty(rawStr.substr(end + delimiterLength).trimEnd())
        const [property, convert] = inline.split(splitter).map(s => s.trim())
        return {property, convert, before, after}
      }
    }
  }

  /**
   * Finds the inline calls and returns an array of watches. Also modifies the
   * actual node object to remove inline call code.
   *
   * Notes:
   *
   *  - It only detects the first inline call in a given string
   *  - Text detection only works with leaf nodes
   *
   * TODO: resolve or throw warnings for the above cases!
   *
   * @param {node} node A node from babel.
   *
   * @return {number} An array of watch objects as [{name, convert, target}...]
   */
  processInlineWatches(node, config) {
    const watches = []
    const atts = extractAtts(node)
    const restrictedAtts = Object.values(config.directives)

    /**
     * Adds a watch if it detects an inline call. Returns true if one was found,
     * else false. Bad practice but will do for now.
     */
    const addInlineWatches = (rawStr, target) => {
      const inlineCallDetails = this.splitInlineText(rawStr)
      if (inlineCallDetails) {
        // This watch may have 'raw' key
        let watch = this.buildInlineWatch(target, inlineCallDetails)
        watches.push(watch)
        return true
      }
      return false
    }

    // extract from node's text
    if (isLeafNode(node)) {
      if (addInlineWatches(node.innerHTML, 'text')) {
        node.innerHTML = ''
      }
    }

    // extract from node's attributes
    for (let [key, value] of Object.entries(atts)) {
      if (value && !restrictedAtts.includes(key)) {
        if (addInlineWatches(value, `@${key}`)) {
          removeAtt(node, key)
        }
      }
    }
    return watches
  }

}

module.exports = {NodeData}