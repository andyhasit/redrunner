const c = console
const {extractAtts, getAttVal, removeAtt} = require('../utils/dom')
const {NodeData} = require('./node_data')

/**
 * Extracts the relevant data from the HTML node, and removes parts that need removed.
 * @param {Object} node - a nodeInfo instance from the walker
 * @param {Object} config - the global config object
 * @param {DomWalker} walker - the walker itself (just for raising exceptions)
 * @param {boolean} asStub - indicates whether we are processing a stub.
 */
function extractNodeData(node, config, walker, asStub) {
  const nodeData = new NodeData(node, asStub)

  // Check inline calls
  const inlines = nodeData.processInlineWatches(node, config)
  let hasData = inlines.length > 0
  inlines.forEach(w => nodeData.watches.push(w))

  // Check attributes for directives
  if (node.attributes.length > 0) {
    for (let [directiveName, directive] of Object.entries(config.directives)) {
      let attVal = getAttVal(node, directiveName)
      if (attVal) {
        hasData = true
        nodeData.processDirective(directiveName, directive, attVal)
        removeAtt(node, directiveName)
      }
    }
  }

  // Process event attributes
  const remainingAtts = extractAtts(node)
  if (remainingAtts) {
    for (let [key, value] of Object.entries(remainingAtts)) {
      if (key.toLowerCase().startsWith(':on')) {
        let event = key.substr(3)
        let directive = {
          params: 'callbackStr',
          handle: function(callbackStr) {
            this.addEventListener(event, callbackStr)
          }
        }
        nodeData.processDirective(key, directive, value)
        hasData = true
        removeAtt(node, key)
      }
    }
  }

  return hasData ? nodeData : undefined
}


module.exports = {extractNodeData}