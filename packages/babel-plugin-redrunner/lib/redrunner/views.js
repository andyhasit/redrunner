const {watchArgs} = require('./constants')

/**
 * Functionality relating to RedRunner Views
 */

/**
 * Returns the string for call to __gw() including the args based on nodePath.
 */
function getWrapperCall(nodePath) {
  return `__gw(${lookupArgs(nodePath)})`
}

/**
 * Returns the args string for a node lookup based on nodePath.
 * 
 * @param {array} nodePath The path to the node as array of indices in the dom
 *    tree e.g. [1, 0]
 */
function lookupArgs(nodePath) {
  return `[${nodePath.slice(2)}]`
}

/**
 * Expands a field's shorthand notation as follows:
 *
 *   field    >  this.props.field
 *   .field   >  this.field
 *   ..field  >  field
 *
 *   And a special exception, which does not belong here!
 *
 *   ''       >  true
 */
function expandShorthand(field) {
  if (field == '') {
    return true
  }
  if (field.startsWith('..')) {
    return field.substr(2)
  } else if (field.startsWith('.')) {
    return 'this.' + field.substr(1)
  }
  return 'this.props.' + field
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
function expandConverter(convert) {
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
function expandProperty(property) {
  const expanded = expandShorthand(property)
  return property.endsWith('?') ? expanded.slice(0, -1) + '()' : expanded
}

/**
 * Replaces the () at the end of name with ? so we don't create two watches for the same thing
 */
function adjustName(name) {
  return name.endsWith('()') ? name.slice(0, -2) + '?' : name
}

function parseTarget(target) {
  if (target.startsWith('@')) {
    target = 'att:' + target.substr(1)
  }
  const [method, arg] = target.split(':')
  if (arg) {
    return `${method}('${arg}', `
  }
  return target + '('
}

module.exports = {
  adjustName,
  expandConverter, 
  expandProperty, 
  expandShorthand, 
  getWrapperCall, 
  lookupArgs, 
  parseTarget
}
