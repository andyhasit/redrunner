const {redrunnerDefs} = require("../definitions/constants")

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
  const type = node.type
  if (type === 'TemplateLiteral') {
    return node.quasis[0].value.raw
  } else if (type === 'TaggedTemplateExpression') {
    return node.quasi.quasis[0].value.raw
  } else if (type === 'StringLiteral') {
    return node.value
  }
  throw new Error(`HTML template value must be a TemplateLiteral\
    TaggedTemplateExpression, or StringLiteral (found ${type}).`)
}


function getNodeHtmlObjectOfStrings(node) {
  const htmlStrings = {}
  node.properties.forEach(element => {
    htmlStrings[element.key.name] = getNodeHtmlString(element.value)
  })
  return htmlStrings
}

module.exports = {
  getNodeHtmlString,
  getNodeHtmlObjectOfStrings,
  removeRedrunnerDefs
}