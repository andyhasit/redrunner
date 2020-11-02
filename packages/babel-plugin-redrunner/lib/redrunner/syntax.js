/**
 * Functionality relating to RedRunner __html__ syntax.
 */
const {c, EOL} = require('../utils/constants')
const {findNextClosingTagOrWhiteSpace} = require('../utils/dom')

/**
 * The name of the arg representing the view in the buildView method.
 */
const viewVar = 'view'

/**
 * Replaces the () at the end of name with ? so we don't create two watches for the same thing
 */
const adjustName = (name) => {
  return name.endsWith('()') ? name.slice(0, -2) + '?' : name
}

/**
 * Builds the call to create a cache for child views.
 * 
 * @param {string} cacheDef - the name of the view class to cache, or if it
 * starts with @ then it is the path to a cache object (e.g. @..sharedCache ).
 * @param {string} cacheKey - the field on the props to cache by.
 */
function buildCacheInit (cacheDef, cacheKey){
  if (cacheDef.startsWith('@')) {
    let cacheStatement = this.parseWatchedValueSlot(cacheDef.substr(1))
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
function buildWatchCallbackLine(saveAs, convert, target, raw, extraArgs) {
  let callbackBody, wrapper = `this.dom.${saveAs}`
  convert = convert ? this.expandConverter(convert) : ''
  if (target) {
    const targetString = parseWatchTargetSlot(target)
    if (raw) {
      callbackBody = `${wrapper}.${targetString}${raw})`
    } else if (convert) {
      if (extraArgs) {
        callbackBody = `${wrapper}.${targetString}${convert}, ${extraArgs})`
      } else {
        callbackBody = `${wrapper}.${targetString}${convert})`
      }
    } else {
      callbackBody = `${wrapper}.${targetString}n)`
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
function buildEventCallback(statement) {
  let text = this.expandPrefix(statement.trim())
  // Cater for '?' ending
  text = text.endsWith('?') ? text.slice(0, -1) : text
  const extra = text.endsWith(')') ? '' : '(e, w)'
  // Convert 'this' to 'view' because of binding
  text = text.startsWith('this.') ? 'view' + text.substr(4) : text
  const body = `${text}${extra}`
  // TODO: do we need the intermediate function? Can't we just bind?
  return ['function(e, w) {', body, '}'].join(EOL)
}


/**
 * expands the convert slot, including the expandPrefix
 *
 *   undefined  >  undefined
 *   ''         >  undefined
 *   foo        >  this.props.foo()
 *   foo!       >  this.props.foo
 *   foo?       >  this.props.foo(n, o)
 *   foo(x, 2)  >  this.props.foo(x, 2)
 *
 */
function expandConverter(convert) {
  if (convert && (convert !== '')) {

    // If it ends with ) then we treat it as raw function call.
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
 * expands the watched property slot, including the expandPrefix:
 *
 *   undefined  >  undefined
 *   ''         >  undefined
 *   foo        >  this.props.foo
 *   foo?       >  this.props.foo()
 *   foo()      >  this.props.foo()
 *   foo(x, 2)  >  this.props.foo(x, 2)
 *   .foo       >  this.foo
 *   ..foo      >  foo
 *
 */
function parseWatchedValueSlot(property) {
  if (property == '*') {
    return '*'
  }
  if (property === '' || property === undefined) {
    return undefined
  }

  // Remove ! because it's just the user explicity marking this a field
  property = property.endsWith('!') ? property.slice(0, -1) : property

  const expanded = this.expandPrefix(property)
  return property.endsWith('?') ? expanded.slice(0, -1) + '()' : expanded
}


/**
 * Expands a field's shorthand notation as follows:
 *
 *   field    >  this.props.field
 *   .field   >  this.field
 *   ..field  >  field
 * 
 * If convertToCall is true then field ending with ? is replaced with ()
 */
function expandPrefix(field, convertToCall=false) {
  if (convertToCall && field.endsWith('?')) {
    field = field.slice(0, -1) + '()'
  }
  if (field.startsWith('..')) {
    return field.substr(2)
  } else if (field.startsWith('.')) {
    return this.asStub ? 'this.parent.' + field.substr(1) : 'this.' + field.substr(1)
  }
  return this.asStub ? 'this.parent.props.' + field : 'this.props.' + field
}


/**
 * Returns the args string for a node lookup based on nodePath.
 *
 * @param {array} nodePath The path to the node as array of indices in the dom
 *    tree e.g. [1, 0]
 */
const getLookupArgs = (nodePath) => {
  return `[${nodePath.slice(2)}]`
}

/**
 * Returns the callback for the watch query, or undefined.
 */
function getWatchQueryCallBack(property) {
  if (property !== '*') {
    return (property === '' || property === undefined) ?
      'function() {return null}' :
      `function() {return ${this.parseWatchedValueSlot(property)}}`
  }
}

function parseWatchTargetSlot(target) {
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
 * The character on which to split attributes and inlines
 */
const splitter = '|'

/**
 * The args string for watch callbacks.
 */
const watchArgs = '(n, o)'


module.exports = {
  adjustName,
  buildCacheInit,
  buildWatchCallbackLine,
  buildEventCallback,
  parseWatchedValueSlot,
  expandConverter,
  expandPrefix,
  getLookupArgs,
  getWatchQueryCallBack,
  parseWatchTargetSlot,
  splitter,
  watchArgs
}
