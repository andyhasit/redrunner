const {redrunnerAtts} = require('./constants');
const {getAttVal} = require('./utils');


function parseWATCH(attString) {
	if (attString) {
		const chunks = attString.split(':')
		const values = {
			'name': chunks[0].trim(),
			'convert': undefined,
			'target': undefined,
		}
		if (chunks[1].trim() != '') {
			values.convert = chunks[1].trim()
		}
		if (chunks.length > 2) {
			if (chunks[2].trim() == '') {
				values.target = 'text'
			} else {
				values.target = chunks[2].trim()
			}
		}
		return values
	}
}


function parseON(attString) {
	if (attString) {
		const chunks = attString.split(':')
		const values = {
			'event': chunks[0].trim(),
			'callback': chunks[1].trim()
		}
		return values
	}
}


function getNodeSpec(node) {
  const nodeAtts = node.rawAttrs
  return {
    'args': getAttVal(nodeAtts, redrunnerAtts.ARGS),
    'saveAs': getAttVal(nodeAtts, redrunnerAtts.AS),
    'on': parseON(getAttVal(nodeAtts, redrunnerAtts.ON)),
    'watch': parseWATCH(getAttVal(nodeAtts, redrunnerAtts.WATCH)),
  }
}


module.exports = {getNodeSpec}