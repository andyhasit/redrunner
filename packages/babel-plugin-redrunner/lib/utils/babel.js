
/**
 * A visitor which removes a property, because that's Babel wants you to do it.
 */
const RemoveClassPropertyVisitor = {
  ClassProperty(path) {
    path.remove()
  }
}

/** 
 * Convenience function for removing a property from the visited class.
 */
function removeProperty(path){
  path.traverse(RemoveClassPropertyVisitor)
}

/**
 * Returns the node's HTML as a string (as it is stored differently if the 
 *    string uses quasi quotes instead of normal quotes)
 */
function getNodeHtmlString(node) {
  let rawText = node.value.quasis ? node.value.quasis[0].value.raw : node.value.value
  return rawText
}

module.exports = {
  getNodeHtmlString,
  removeProperty
}