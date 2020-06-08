const {c, htmlparse} = require('../utils/constants')
const {stripHtml} = require('../utils/dom')

/**
 * Handles the task of parsing a RedRunner view, including:
 *
 *  - DOM traversal
 *  - Error context
 */
class DomWalker {
  constructor(html, processNode) {
    //TODO The lookups go wrong if we don't strip the HTML.
    // but then we also lose the line position for showing errors.
    this.html = stripHtml(html)
    this.processNode = processNode
    this.dom = undefined
    this.currentNode = undefined
  }
  parse() {
    this.dom = htmlparse.parse(this.html)
    const nodePath = []    // The path of current node recursion

    /**
     * Called recursively to process each node in the DOM
     */
    const walkNode = (node, i) => {
      this.currentNode = node
      nodePath.push(i)
      const tagName = node.tagName
      if (tagName) {
        this.processNode({nodePath, node, tagName})
      }
      node.childNodes.forEach(walkNode)
      nodePath.pop()
    }
    walkNode(this.dom)
  }
  /**
   * Returns a short variable name guaranteed to be unique within the view.
   */

  /**
   * Exit with an error.
   * TODO: flesh this out to print more useful info.
   */
  throw(message) {
    c.log(this.currentNode)
    new Error(message)
  }
}


module.exports = {DomWalker}