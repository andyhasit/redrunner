const {getAttVal, removeAtt} = require('../utils/dom')
const {extractInlineWatches} = require('./inline')
const {NodeData} = require('./node-data')


function extractNodeData(node, config) {
	const nodeAtts = node.rawAttrs
	const nodeData = new NodeData(node)

	// Check inline calls
  const inlines = extractInlineWatches(node, config)
	let hasData = inlines.length > 0
  inlines.forEach(w => nodeData.watches.push(w))

	// Check attributes for directives
	if (nodeAtts && nodeAtts !== '') {
		for (let [directiveName, directive] of Object.entries(config.directives)) {
	  	let attVal = getAttVal(nodeAtts, directiveName)
	  	if (attVal) {
	  		hasData = true
	  		nodeData.processDirective(directiveName, directive, attVal)
	  		removeAtt(node, directiveName)
	  	}
		}
	}
	return hasData ? nodeData : undefined
}


module.exports = {extractNodeData}