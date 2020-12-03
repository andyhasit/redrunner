const {extractAtts, getAttVal, removeAtt} = require('../utils/dom')
const {NodeData} = require('../definitions/node_data')
const {processInlineWatches} = require('./inline_directives')
const {processDirective} = require('../config/parse_directives')

/**
 * Extracts the relevant data from the HTML node, and removes parts that need removed.
 * Returns a NodeData object if there are directives found.
 * 
 * @param {Object} node - a nodeInfo instance from the walker
 * @param {Object} config - the global config object
 * @param {DomWalker} walker - the walker itself (just for raising exceptions)
 * @param {boolean} processAsStub - indicates whether we are processing a stub.
 */
function extractNodeData(node, config, walker, processAsStub) {
  const nodeData = new NodeData(node, processAsStub)

  // Check inline calls
  processInlineWatches(nodeData, node, config)
  let hasData = nodeData.watches.length > 0

  // Check attributes for directives
  if (node.attributes && node.attributes.length > 0) {
    for (let [directiveName, directive] of Object.entries(config.directives)) {
      let attVal = getAttVal(node, directiveName)
      if (attVal) {
        hasData = true
        processDirective(nodeData, directiveName, directive, attVal)
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
        processDirective(nodeData, key, directive, value)
        hasData = true
        removeAtt(node, key)
      }
    }
  }

  return hasData ? nodeData : undefined
}


module.exports = {extractNodeData}