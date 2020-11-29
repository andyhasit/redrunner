/**
 * This module deals with parsing inline directives.
 */
const {splitter} = require('../utils/constants')
const {extractAtts, isLeafNode, removeAtt} = require('../utils/dom')
const {clearIfEmpty} = require('../utils/misc')
const {config} = require('../config')

// Settings for inline directives
const [startDelimiter, endDelimiter] = config.options.inlineDelimiters
const delimiterLength = startDelimiter.length

/**
 * Finds the inline calls and adds watches. Also modifies the
 * actual node object to remove inline call code.
 *
 * Notes:
 *
 *  - It only detects the first inline call in a given string
 *  - Text detection only works with leaf nodes
 *
 * TODO: resolve or throw warnings for the above cases!
 *
 * @param {node} node A node from babel.
 *
 * @return {number} An array of watch objects as [{name, convert, wrapperMethod}...]
 */
const processInlineWatches = (nodeData, node, config) => {
  const atts = extractAtts(node)
  const restrictedAtts = Object.values(config.directives)

  /**
   * Adds a watch if it detects an inline call. Returns true if one was found,
   * else false. Bad practice but will do for now.
   */
  const addInlineWatches = (rawStr, wrapperMethod) => {
    const inlineCalls = splitInlineText(rawStr)
    if (inlineCalls) {
      // This watch may have 'raw' key
      let watch = buildInlineWatch(nodeData, wrapperMethod, inlineCalls)
      const watch = {wrapperMethod}
      nodeData.watches.push(watch) // do not use addWatch here.
      return true
    }
    return false
  }

  // extract from node's text
  if (isLeafNode(node)) {
    if (addInlineWatches(node.innerHTML, 'text')) {
      node.innerHTML = ''
    }
  }

  // extract from node's attributes
  for (let [key, value] of Object.entries(atts)) {
    if (value && !restrictedAtts.includes(key)) {
      if (addInlineWatches(value, `@${key}`)) {
        removeAtt(node, key)
      }
    }
  }
}

/**
 * Builds the watch object as:
 * 
 * {
 *    property,  // the watched property
 *    wrapperMethod  ,  // the wrapper method
 * }
 */
const buildInlineWatch = (nodeData, wrapperMethod, inlineCalls) => {
  let raw
  let {property, convert, before, after} = inlineCalls
  /*
  before and after is any text found before or after the brackets.
  raw is the raw javascript code that will be generated.
  */
  convert = convert ? nodeData.expandConverter(convert) : 'n'
  if (before && after) {
    raw = `"${before}" + ${convert} + "${after}"`
  } else if (before && !after) {
    raw = `"${before}" + ${convert}`
  } else if (!before && after) {
    raw = `${convert} + "${after}"`
  } else {
    raw = convert
  }
  return {property, raw, wrapperMethod}
}

  
/**
 * If an inline is found, returns an object with its details, else undefined.
 *
 * @return {object} As {name, convert, before, after}
 *
 * convert, before and after may be undefined. Before and after will be partially
 *     trimmed.
 *
 * Examples:
 *
 *  "{style}"                     >  {style, undefined, undefined, undefined}
 *  "my-style {style}"            >  {style, undefined, 'my-style ', undefined}
 *  "  my-style {style}   "       >  {style, undefined, 'my-style ', undefined}
 *  "my-style {style|foo} xyz  "  >  {style, foo, 'my-style ', ' xyz'}
 *
 */

const splitInlineText = (rawStr) => {
  const start = rawStr.indexOf(startDelimiter)
  let end = 0
  if (start >= 0) {
    end = rawStr.indexOf(endDelimiter)
    if (end > start) {
      const inline = rawStr.substring(start + delimiterLength, end)
      let before = clearIfEmpty(rawStr.substr(0, start).trimStart())
      let after = clearIfEmpty(rawStr.substr(end + delimiterLength).trimEnd())
      const [property, convert] = inline.split(splitter).map(s => s.trim())
      return {property, convert, before, after}
    }
  }
}


module.exports = {processInlineWatches}