/**
 * Utility functions for working with DOM and HTML.
 */

const {c, EOL} = require('./constants')
const {JSDOM} = require("jsdom")
const document = new JSDOM('<!doctype html><html><body></body></html>').window.document


const parseHTML = function(html) {
  const throwAway = document.createElement('template')
  throwAway.innerHTML = stripHtml(html)
  return throwAway.content.firstChild
}

function getAttVal(node, attName) {
  return node.getAttribute(attName)
}


/**
 * Determines whether a node from node-html-parser is a leaf node, or rather,
 * whether it only contains TextNodes as children (or no children).
 */
function isLeafNode(node) {
  const childNodes = Array.from(node.childNodes)
  return !childNodes.filter(n => n.nodeType != 3).length > 0
}

/** Extracts node's atts as an object.
 */
function extractAtts(node) {
  const throwAway = document.createElement('template')
  throwAway.innerHTML = node.outerHTML
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
 * 
 * It also ignores case in the search (but returns with case unmodified)
 * which is to enable us to delete onclick as well as onClick, so add tests
 * if changing this.
 */
function getAttDefinition(attStr, attName) {
  if (attStr) {
    let withEqualSign = attName.toLowerCase() + '='
    let valueStartIndex = withEqualSign.length + 1
    let start = attStr.toLowerCase().search(withEqualSign)
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
 * Removes an attribute (in-place)
 */
function removeAtt(node, att) {
  node.removeAttribute(att)
}

/**
 * Returns the position of the next closing tag, or whitespace, whichever comes first.
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

/**
 * A hack to allow the following syntac 
 * 
 *    <use:Child/>
 *    <use=Child/>
 * 
 * With the JSDOM parser. It coverts those to:
 * 
 *    <br :use=Child/>
 * 
 * which will work
 */
function preprocessHTML(htmlString) {
  return htmlString.replace(/<use:/g, "<br :use=")
    .replace(/<use=/g, "<br :use=")
    .replace(/<stub:/g, "<br :stub=")
    .replace(/<stub=/g, "<br :stub=")
}

module.exports = {
  extractAtts,
  findNextClosingTagOrWhiteSpace,
  getAttVal,
  getAttDefinition,
  isLeafNode,
  parseHTML,
  preprocessHTML,
  removeAtt,
  stripHtml
}