/*
Functionality relating to RedRunner Views
*/

const {c} = require('./constants')


/* Returns a call to __gw, which finds the node references by its tree index (e.g. [1, 0]) */
function getWrapperCall(nodePath) {
  return `__gw(${lookupArgs(nodePath)})`
}

/* The 
 */
function lookupArgs(nodePath) {
  return `[${nodePath.slice(2)}]`
}


function expandField(field) {
    if (field.startsWith('..')) {
        return 'this.props.' + field.substr(2)
    } else if (field.startsWith('.')) {
        return 'this.' + field.substr(1)
    }
    return field
}

module.exports = {
	expandField, 
	getWrapperCall
}

