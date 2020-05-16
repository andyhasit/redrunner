const {redrunnerAtts} = require('./constants');
const {getAttVal} = require('./utils');


/* Returns a call to __gw, which finds the node references by its tree index (e.g. [1, 0]) */
function getWrapperCall(nodePath) {
  return `__gw(${lookupArgs(nodePath)})`
}

function lookupArgs(nodePath) {
  return `[${nodePath.slice(2)}]`
}

function expandField(field) {
	if (field.startsWith('..')) {
		return 'this.props.' + field.substr(2)
	} else if (field.startsWith('.')) {
		return 'this.' + field.substr(1)
	}
	return field
}


function parseWATCH(attString) {
	if (attString) {
		const chunks = attString.split(':')
		const values = {
			'name': chunks[0].trim(),
			'convert': undefined,
			'target': undefined,
		}
		if (chunks[1].trim() != '') {
			values.convert = expandField(chunks[1].trim())
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
			'callback': `(e, w) => ${expandField(chunks[1].trim())}(e, w)`
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


module.exports = {expandField, getNodeSpec, lookupArgs, getWrapperCall}