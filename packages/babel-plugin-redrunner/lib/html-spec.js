const {redrunnerAtts} = require('./constants');
const {getAttVal} = require('./utils');


function getNodeSpec(node) {
  const nodeAtts = node.rawAttrs
  return {
    'args': getAttVal(nodeAtts, redrunnerAtts.ARGS),
    'saveAs': getAttVal(nodeAtts, redrunnerAtts.AS),
    'on': getAttVal(nodeAtts, redrunnerAtts.ON),
    'watch': getAttVal(nodeAtts, redrunnerAtts.WATCH),
  }
}


module.exports = {getNodeSpec}