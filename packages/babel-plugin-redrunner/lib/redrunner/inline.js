/**
 * This modules relates to finding inline calls, e.g.
 *
 * <span>Hello {{..name}}</span>
 * <span class="{{getCss}}">Hello</span>
 *
 */

const {c} = require('../utils/constants')
const {getAttVal} = require('../utils/dom')

/**
 * Finds the inline calls and returns an array of watches.
 *
 * @param {node} node A node from babel.
 * @return {number} An array of watch objects as [{name, convert, target}...]
 */
function extractInlineCalls(node) {
	const watches = []
  const nodeAtts = node.rawAttrs

  
  function extractInlines(rawStr, ) {

  }

  extractInlines(node.rawText, 'text')
  return watches
}


module.exports = {extractInlineCalls}