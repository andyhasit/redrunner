/**
 * This modules relates to finding inline calls, e.g.
 *
 * <span>Hello {{name|.foo}}</span>
 * <span class="{{getCss}}">Hello</span>
 *
 */

const {c} = require('../utils/constants')
const {extractAtts, isLeafNode, removeAtt} = require('../utils/dom')
const {expandConverter, splitter} = require('./syntax')

/**
 * Returns undefined if string is only whitespace, else the original string.
 */
function clearIfEmpty(str) {
	if (str.trim().length > 0) {
		return str
	}
}

/**
 * If an {{inline}} is found, returns an object with its details, else undefined.
 *
 * @return {object} As {name, convert, before, after}
 *
 * convert, before and after may be undefined. Before and after will be partially
 *     trimmed.
 *
 * Examples:
 *
 *  "{{style}}"                     >  {style, undefined, undefined, undefined}
 *  "my-style {{style}}"            >  {style, undefined, 'my-style ', undefined}
 *  "  my-style {{style}}   "       >  {style, undefined, 'my-style ', undefined}
 *  "my-style {{style|foo}} xyz  "  >  {style, foo, 'my-style ', ' xyz'}
 *
 */
function splitInlineText(rawStr) {
	let end = 0
	let start = rawStr.indexOf('{{')
	if (start >= 0) {
		end = rawStr.indexOf('}}')
		if (end > start) {
			const inline = rawStr.substring(start + 2, end)
			let before = clearIfEmpty(rawStr.substr(0, start).trimStart())
			let after = clearIfEmpty(rawStr.substr(end + 2).trimEnd())
			const [property, convert] = inline.split(splitter).map(s => s.trim())
			return {property, convert, before, after}
		}
	}
}

/**
 * Builds the watch object.
 */
function buildInlineWatch(target, inlineCallDetails) {
	let raw
	let {property, convert, before, after} = inlineCallDetails
  /*
  before and after is any text found before or after the brackets.
  raw is the raw javascript code that will be generated.

  */
	convert = convert ? expandConverter(convert) : 'n'
	if (before && after) {
		raw = `"${before}" + ${convert} + "${after}"`
	} else if (before && !after) {
		raw = `"${before}" + ${convert}`
	} else if (!before && after) {
		raw = `${convert} + "${after}"`
	} else {
		raw = convert
	}
	return {property, raw, target}
}

/**
 * Finds the inline calls and returns an array of watches. Also modifies the
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
 * @return {number} An array of watch objects as [{name, convert, target}...]
 */
function extractInlineWatches(node, config) {
	const watches = []
  const atts = extractAtts(node)
  const restrictedAtts = Object.values(config.directives)

  /**
   * Adds a watch if it detects an inline call. Returns true if one was found,
   * else false. Bad practice but will do for now.
   */
	function addInlineWatches(rawStr, target) {
		const inlineCallDetails = splitInlineText(rawStr)
		if (inlineCallDetails) {
			let watch = buildInlineWatch(target, inlineCallDetails)
			watches.push(watch)
			return true
		}
		return false
	}

	// extract from node's text
	if (isLeafNode(node)) {
  	if (addInlineWatches(node.rawText, 'text')) {
  		node.childNodes = []
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
  return watches
}

module.exports = {extractInlineWatches}