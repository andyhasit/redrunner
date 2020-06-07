/**
 * Functionality relating to RedRunner __html__ syntax.
 */


/**
 * Replaces the () at the end of name with ? so we don't create two watches for the same thing
 */
const adjustName = (name) => {
  return name.endsWith('()') ? name.slice(0, -2) + '?' : name
}


/**
 * Builds the call to create a cache.
 */
const buildCacheInit = (cacheDef, cacheKey) => {
  if (cacheDef.startsWith('@')) {
    let cacheStatement = expandProperty(cacheDef.substr(1))
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
 */
const buidlCallbackStatement = (saveAs, convert, target, raw) => {
  let callbackBody, wrapper = `this.dom.${saveAs}`
  convert = convert ? expandConverter(convert) : ''
  if (target) {
    const targetString = parseTarget(target)
    if (raw) {
      callbackBody = `${wrapper}.${targetString}${raw})`
    } else if (convert) {
      callbackBody = `${wrapper}.${targetString}${convert})`
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
const buildEventCallback = (statement) => {
  let text = this.expandShorthand(statement.trim())
  const extra = text.endsWith(')') ? '' : '(e, w)'
  // Cater for '?' ending
  text = text.endsWith('?') ? text.slice(0, -1) : text
  // Convert 'this' to 'view' because of binding
  text = text.startsWith('this.') ? 'view' + text.substr(4) : text
  const body = `${text}${extra}`
  // TODO: do we need the intermediate function? Can't we just bind?
  return ['function(e, w) {', body, '}'].join(EOL)
}


/**
 * expands the convert slot, including the expandShorthand
 *
 *   undefined  >  undefined
 *   ''         >  undefined
 *   foo        >  this.props.foo
 *   foo?       >  this.props.foo(n, o)
 *   foo()      >  this.props.foo()
 *   foo(x, 2)  >  this.props.foo(x, 2)
 *   .foo       >  this.foo
 *   ..foo      >  foo
 *
 */
const expandConverter = (convert) => {
  if (convert && (convert !== '')) {
    const expanded = expandShorthand(convert)
    return convert.endsWith('?') ? `${expanded.slice(0, -1)}${watchArgs}` : expanded
  }
}


/**
 * expands the watched property slot, including the expandShorthand:
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
const expandProperty = (property) => {
  if (property == '*') {
    return '*'
  }
  if (property === '' || property === undefined) {
    return undefined
  }
  const expanded = expandShorthand(property)
  return property.endsWith('?') ? expanded.slice(0, -1) + '()' : expanded
}


/**
 * Expands a field's shorthand notation as follows:
 *
 *   field    >  this.props.field
 *   .field   >  this.field
 *   ..field  >  field
 */
const expandShorthand = (field) => {
  if (field.startsWith('..')) {
    return field.substr(2)
  } else if (field.startsWith('.')) {
    return 'this.' + field.substr(1)
  }
  return 'this.props.' + field
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
const getWatchQueryCallBack = (property) => {
  if (property !== '*') {
    return (property === '' || property === undefined) ?
      'function() {return null}' :
      `function() {return ${expandProperty(property)}}`
  }
}

const parseTarget = (target) => {
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
  buidlCallbackStatement,
  expandConverter,
  expandProperty,
  expandShorthand,
  getWatchQueryCallBack,
  getLookupArgs,
  parseTarget,
  splitter,
  watchArgs
}
