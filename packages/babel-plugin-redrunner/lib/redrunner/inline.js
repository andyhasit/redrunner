/**
 * This modules relates to finding inline calls, e.g.
 *
 * <span>Hello {{name|.foo}}</span>
 * <span class="{{getCss}}">Hello</span>
 *
 */

const {c} = require('../utils/constants')
const {extractAtts, getAttDefinition, isLeafNode} = require('../utils/dom')
const {specialAttributes, splitter} = require('./constants')
const {adjustName, expandConverter, expandProperty} = require('./views')

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
			const [name, convert] = inline.split(splitter).map(s => s.trim())
			return {name, convert, before, after}
		}
	}
}

/**
 * Builds the watch object.
 */
function buildInlineWatch(target, inlineCallDetails) {
	let {name, convert, before, after} = inlineCallDetails
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
	return {name: adjustName(name), property: expandProperty(name), raw: raw, target:target}

	// switch(inlineCall.type) {
	//   case 'middle':
	//     // code block
	//     break;
	//   case 'full':
	//     // code block
	//     break;
	//   case 'start':
	//     // code block
	//     break;
	//   case 'end':
	//     // code block
	//     break;
	// }
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
function extractInlineCallWatches(node) {
	const watches = []
  const atts = extractAtts(node)
  const restrictedAtts = Object.values(specialAttributes)

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

	// extract from node text
	if (isLeafNode(node)) {
  	if (addInlineWatches(node.rawText, 'text')) {
  		node.childNodes = []
  	}
  }

	// extract from node attributes
  for (let [key, value] of Object.entries(atts)) {
  	if (value && !restrictedAtts.includes(key)) {
  		if (addInlineWatches(value, `@${key}`)) {
  			let wholeAtt = getAttDefinition(node.rawAttrs, key)
      	node.rawAttrs = node.rawAttrs.replace(wholeAtt, '')
  		}
  	}
	}
  return watches
}


module.exports = {extractInlineCallWatches}