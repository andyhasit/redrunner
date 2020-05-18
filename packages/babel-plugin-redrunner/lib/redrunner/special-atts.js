/*
Relates to finding inline calls, e.g.

    <span watch="..name::"></span>
    <button on="click:.clicked"></button>

*/

const {specialAttributes} = require('./constants')
const {expandField} = require('./views')
const {getAttVal} = require('../utils/dom')


function parseWATCH(attString) {
  if (attString) {
    const chunks = attString.split(':')
    const values = {
      name: expandField(chunks[0].trim()),
      convert: undefined,
      target: undefined,
    }
    if (chunks[1].trim() != '') {
      values.convert = expandField(chunks[1].trim())
    }
    if (chunks.length > 2) {
      values.target = chunks[2].trim() == '' ? 'text' : chunks[2].trim()
    }
    return values
  }
}


function parseON(attString) {
  if (attString) {
    const chunks = attString.split(':')
    const values = {
      event: chunks[0].trim(),
      callback: `(e, w) => ${expandField(chunks[1].trim())}(e, w)`
    }
    return values
  }
}

function findRedRunnerAtts(node) {
  const nodeAtts = node.rawAttrs
  return {
    'args': getAttVal(nodeAtts, specialAttributes.ARGS),
    'saveAs': getAttVal(nodeAtts, specialAttributes.AS),
    'on': parseON(getAttVal(nodeAtts, specialAttributes.ON)),
    'watch': parseWATCH(getAttVal(nodeAtts, specialAttributes.WATCH)),
  }
}



/** Find locations of text in string
 */
function stripRedRunnerAtts(attStr) {
  Object.values(specialAttributes).forEach(att => {
    let wholeAtt = getAttDefinition(attStr, att)
    attStr = attStr.replace(wholeAtt, '')
  })
  // Just trimming extraneous whitespace
  return attStr.split(' ').filter(s => s.length).join(' ')
}


/** Strips redrunner tags from html
 */
function removeRedRunnerCode(dom) {
  // Function called recursively on nodes.
  function processNode(node, i) {
    let attStr = node.rawAttrs
    if (attStr) {
      node.rawAttrs = stripRedRunnerAtts(attStr)
    }
    node.childNodes.forEach(processNode)
  }
  processNode(dom)
  return dom.toString()
}

module.exports = {findRedRunnerAtts, removeRedRunnerCode}