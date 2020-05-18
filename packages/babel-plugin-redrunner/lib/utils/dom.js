/**
 * Utility functions for working with DOM and HTML.
 */

const {c, EOL} = require('./constants')
const {JSDOM} = require("jsdom")
const document = new JSDOM('<!doctype html><html><body></body></html>').window.document

/** Extracts the args string from rawAttrs e.g. 
 *
 *   as=m            >   "m"
 *   args="a, 'b'"   >   "a, 'b'"
 *
 * Note that it does not allow spaces around the = sign!
 */
function getAttVal(attStr, attName) {
  if (attStr) {
    let withEqualSign = attName + '='
    let start = attStr.search(withEqualSign)
    if (start >= 0) {
      attStr = attStr.substr(start + withEqualSign.length)
      let quoteSymbol = attStr[0]
      if (quoteSymbol == '"' || quoteSymbol == "'") {
        // Its in quotes...
        return attStr.substr(1, attStr.indexOf(quoteSymbol, 1) - 1)
      } else {
        // Not in quotes
        return attStr.substr(0, findNextClosingTagOrWhiteSpace(attStr, 0))
      }
    }
  }
}

/**
 * Determines whether a node from node-html-parser is a leaf node, or rather,
 * whether it only contains TextNodes as children (or no children).
 */
function isLeafNode(node) {
  return !node.childNodes.filter(n => n.nodeType != 3).length > 0
}

/** Extracts node's atts as an object.
 */
function extractAtts(node) {
  const throwAway = document.createElement('template')
  throwAway.innerHTML = node.toString()
  const attributes = throwAway.content.firstChild.attributes
  const obj = {}
  if (attributes) {
    for (let i = 0, len = attributes.length; i < len; i++) {
      obj[attributes[i].name] = attributes[i].value;
    }
  }
  return obj
}

/** 
 * Extracts the whole attribute (e.g. "as=me" from rawAttrs
 * Note that it does not allow spaces around the = sign!
 */
function getAttDefinition(attStr, attName) {
  if (attStr) {
    let withEqualSign = attName + '='
    let valueStartIndex = withEqualSign.length + 1
    let start = attStr.search(withEqualSign)
    if (start >= 0) {
      attStr = attStr.substr(start)
      let quoteSymbol = attStr[valueStartIndex - 1]
      if (quoteSymbol == '"' || quoteSymbol == "'") {
        // Its in quotes...
        return attStr.substr(0, attStr.indexOf(quoteSymbol, valueStartIndex) + 1)
      } else {
        // Not in quotes
        return attStr.substr(0, findNextClosingTagOrWhiteSpace(attStr, 0))
      }
    }
  }
}

/** 
 * Returns the position of the next closing tag, or whitespace, whichever comes 
 *    first.
 *
 * Note: the character at position "start" must not be a with whitespace.
 */
function findNextClosingTagOrWhiteSpace(s, start) {
  if (start == undefined) {
    start = 0
  }
  let nextWhiteSpace = findNextWhiteSpace(s, start)
  let nextClosingTag = findNextClosingTag(s, start)
  if (nextWhiteSpace == undefined) {
    return nextClosingTag
  } else if (nextClosingTag == undefined) {
    return nextWhiteSpace
  } else {
    return (nextWhiteSpace > nextClosingTag) ? nextClosingTag : nextWhiteSpace
  }
}

function findNextWhiteSpace(s, start) {
  let index = s.substr(start).search(/\s+/)
  if (index >= 0) {
    return index + start
  }
}

function findNextClosingTag(s, start) {
  let index = s.substr(start).search('>')
  if (index >= 0) {
    return index + start
  }
}

/**
 * Strips extraneous whitespace from HTML
 */
function stripHtml(htmlString) {
  return htmlString.replace(/\n/g, "")
    .replace(/[\t ]+\</g, "<")
    .replace(/\>[\t ]+\</g, "><")
    .replace(/\>[\t ]+$/g, ">")
}

module.exports = {
  extractAtts,
  findNextClosingTagOrWhiteSpace,
  getAttVal,
  getAttDefinition,
  isLeafNode,
  stripHtml
}