const {redrunnerDefs} = require("./constants")

/**
 * A visitor which removes a property, because that's Babel wants you to do it.
 */
const RemoveClassPropertyVisitor = {
  ClassProperty(path) {
    if (redrunnerDefs.includes(path.node.key.name)) {
      path.remove()
    }
  }
}

/**
 * Convenience function for removing a property from the visited class.
 */
function removeRedrunnerDefs(path){
  path.traverse(RemoveClassPropertyVisitor)
}

/**
 * Returns the node's HTML as a string (as it is stored differently if the
 *    string uses quasi quotes instead of normal quotes)
 */
function getNodeHtmlString(node) {
  const nodeValue = node.value
  const type = nodeValue.type
  if (type === 'TemplateLiteral') {
    return nodeValue.quasis[0].value.raw
  } else if (type === 'TaggedTemplateExpression') {
    return nodeValue.quasi.quasis[0].value.raw
  } else if (type === 'StringLiteral') {
    return nodeValue.value
  }
  throw new Error(`HTML template value ${node.key.name} must be a TemplateLiteral\
    TaggedTemplateExpression, or StringLiteral (found ${type}).`)
}

/**
 * Returns the node as an object. Does this even work?
 */
function getNodeObjectValue(node) {
  return node.value
}

function getNodeHtmlStringDict(node) {
  const htmlStrings = {}
  node.value.properties.forEach(element => {
    htmlStrings[element.key.name] = getNodeHtmlString(element)
  })
  return htmlStrings
}

module.exports = {
  getNodeHtmlString,
  getNodeObjectValue,
  getNodeHtmlStringDict,
  removeRedrunnerDefs
}