/*
Relates to finding inline calls, e.g.

	<span>Hello {{..name}}</span>
	<span class="{{getCss}}">Hello</span>

*/

const {c} = require('../utils/constants')
const {getAttVal} = require('../utils/dom')


function findInlineCalls(node) {
  const nodeAtts = node.rawAttrs
  c.log(node.rawText)
}


module.exports = {findInlineCalls}