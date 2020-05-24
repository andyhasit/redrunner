/**
 * Funtionality for working with JavaScript
 */
const {EOL} = require('./constants')

/**
 * Returns a statment adding a function to a prototype.
 */
function addPrototypeFunction(className, name, signature, body) {
  return [`${className}.prototype.${name} = function(${signature}){`, body, '};'].join(EOL)
}

/**
 * Returns a statment adding an object to a prototype.
 */
function addPrototypeObject(className, name, body) {
  return [`${className}.prototype.${name} = {`, body, '};'].join(EOL)
}

/**
 * Returns a statment adding a field to a prototype.
 */
function addPrototypeField(className, name, statment) {
  return [`${className}.prototype.${name} = `, statment, ';'].join(EOL)
}


module.exports = {addPrototypeFunction, addPrototypeObject, addPrototypeField}
