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
 * Adjusts the field for shorthand notation as so:
 *
 *   field    >   this.props.field
 *   .field   >   this.field
 *   ..field  >   field
 *
 */
function expandField(field) {
  if (field.startsWith('..')) {
    return field.substr(2)
  } else if (field.startsWith('.')) {
    return 'this.' + field.substr(1)
  }
  return 'this.props.' + field
}

module.exports = {expandField, getWrapperCall, lookupArgs}
