/**
 * Utility functions for working with DOM and HTML.
 */

const {c, EOL} = require('./constants');

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
  findNextClosingTagOrWhiteSpace,
  getAttVal,
  getAttDefinition,
  stripHtml
}