const {c} = require('../utils/constants')
const {isFunc} = require('../utils/javascript')
const {getAttVal} = require('../utils/dom')


class NodeData {
	constructor(node) {
		this.node = node
		this.saveAs = undefined
		this.wrapperClass = undefined
		this.chainedCalls = []
		this.watchCallbacks = []
		this.beforeSave = []
		this.afterSave = []
	}
	wrapperInit(nodePath) {
    const path = this.getLookupArgs(nodePath)
    return this.wrapperClass ? `new ${this.wrapperClass}(view.__lu(${path}))` : `view.__gw(${path})`
	}
	getLookupArgs(nodePath) {
		return `[${nodePath.slice(2)}]`
	}
	addEventListener(event, callbackStr) {
    const callbackCode = buildEventCallbackCode(callbackStr)
		this.chainedCalls.push(`on('${event}', ${callbackCode})`)
  }
  buildEventCallbackCode(arg) {
  	let text = expandShorthand(arg.trim())
    const extra = text.endsWith(')') ? '' : '(e, w)'
    // Cater for '?' ending
    text = text.endsWith('?') ? text.slice(0, -1) : text
    // Convert 'this' to 'view' because of binding
    text = text.startsWith('this.') ? 'view' + text.substr(4) : text
    const body = `${text}${extra}`
    // TODO: do we need the intermediate function? Can't we just bind?
    return ['function(e, w) {', body, '}'].join(EOL)
  }
	processDirective(directiveName, directive, attVal) {
		if (isFunc(directive)) {
	    directive.apply(this, [attVal])
		} else {
			let args
			if (directive.hasOwnProperty('args')) {
				args = isFunc(directive.args) ? directive.args(attVal) : this.parseArgs(directive.args, attVal)
			} else {
				args = attVal
			}

		}
	}
	parseArgs(params, attVal) {
		const args = []
		const chunks = attVal.split('|')
	  for (let i=0, il=params.length; i<il; i++) {
	  	let param = params[i]
	  	let raw = chunks[i]
	  	let value = isFunc(param) ? param(value, i) : this.parseArgValue(param, raw, i)
	  	args.push(value)
	  }
	  return args
	}
	parseArgValue(param, raw, i) {
		if (param.endsWith('?')) {
			if (isUnd(raw)) {
				throw new
			}
			param = param.substr(0, -1)
		}
		if (this.argParsers.hasOwnProperty(param)) {

		} else {

		}
	}
}


function parseNode(node, config) {
	const nodeAtts = node.rawAttrs
	const nodeData = new NodeData(node)
	let hasData = false
	if (nodeAtts && nodeAtts !== '') {
		for (let [directiveName, directive] of Object.entries(config.directives)) {
	  	let attVal = getAttVal(nodeAtts, directiveName)
	  	if (attVal) {
	  		hasData = true
	  		nodeData.processDirective(directiveName, directive, attVal)
	  	}
		}
	}
	return hasData ? nodeData : undefined
}


module.exports = {parseNode}