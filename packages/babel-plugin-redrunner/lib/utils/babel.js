
/* A visitor used for removing a property, because that's how you do it.
 */
const RemoveClassPropertyVisitor = {
  ClassProperty(path) {
    path.remove()
  }
}

/* Convenience function for removing a property from the visited class.
 */
function removeProperty(path){
  path.traverse(RemoveClassPropertyVisitor)
}

/* Returns the node's HTML as a string.
 */
function getNodeHtmlString(node) {
  let rawText = node.value.quasis ? node.value.quasis[0].value.raw : node.value.value
  return rawText
}

module.exports = {
  getNodeHtmlString,
  removeProperty
}