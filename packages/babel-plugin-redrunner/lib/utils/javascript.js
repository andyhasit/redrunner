/*
Funtionality for working with JavaScript
*/
const {EOL} = require('./constants')

function addPrototypeFunction(className, name, signature, body) {
  return [`${className}.prototype.${name} = function(${signature}){`, body, '};'].join(EOL)
}

function addPrototypeObject(className, name, body) {
  return [`${className}.prototype.${name} = {`, body, '};'].join(EOL)
}

module.exports = {addPrototypeFunction, addPrototypeObject}

