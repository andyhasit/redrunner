const {c, EOL} = require('../utils/constants')
const {isFunc, isUnd, splitTrim} = require('../utils/javascript')
const {getAttVal} = require('../utils/dom')
const {extractInlineWatches} = require('./inline')


class NodeData {
	constructor(node) {
		this.node = node
		this.saveAs = undefined
		this.wrapperClass = undefined
		this.chainedCalls = []
		this.watches = []
		this.beforeSave = []
		this.afterSave = []
	}
	addWatch(property, converter, target) {
		this.watches.push({property, converter, target})
  }
	/**
	 * Expands a field's shorthand notation as follows:
	 *
	 *   field    >  this.props.field
	 *   .field   >  this.field
	 *   ..field  >  field
	 */
	expandShorthand(field) {
	  if (field.startsWith('..')) {
	    return field.substr(2)
	  } else if (field.startsWith('.')) {
	    return 'this.' + field.substr(1)
	  }
	  return 'this.props.' + field
	}
	wrapperInit(nodePath) {
    const path = this.getLookupArgs(nodePath)
    return this.wrapperClass ? `new ${this.wrapperClass}(view.__lu(${path}))` : `view.__gw(${path})`
	}
	getLookupArgs(nodePath) {
		return `[${nodePath.slice(2)}]`
	}
	addEventListener(event, callbackStr) {
    const callbackCode = this.buildEventCallbackCode(callbackStr)
		this.chainedCalls.push(`on('${event}', ${callbackCode})`)
  }
  buildEventCallbackCode(statement) {
  	let text = this.expandShorthand(statement.trim())
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
		if (!isFunc(directive.handle)) {
			throw new Error('handle must be a function')
		}
		let args = attVal
		if (directive.hasOwnProperty('params')) {
			let params = splitTrim(directive.params, ',')
			args = this.parseArgs(params, attVal)
	  	directive.handle.apply(this, args)
		} else {
	  	directive.handle.apply(this, [args])
		}
	}
	/**
	 * Return array of args based on definitions
	 *
	 * @param {Array} params The parameters as strings
	 * @param {String} attVal The raw attribute value.
	 */
	parseArgs(params, attVal) {
		const args = []
		const chunks = splitTrim(attVal, '|')
	  for (let i=0, il=params.length; i<il; i++) {
	  	let param = params[i]
	  	let raw = chunks[i]
	  	let value = this.parseArgValue(param, raw, i)
	  	args.push(value)
	  }
	  return args
	}
	parseArgValue(param, raw, i) {
		if ((!param.endsWith('?')) && (isUnd(raw))) {
			throw new Error(`Argument ${param} is required`)
		}
		return raw
	}
	expandProperty(arg) {
		if (arg == '*') {
    	return '*'
	  }
	  if (arg === '' || arg === undefined) {
	    return undefined
	  }
	  const expanded = expandShorthand(arg)
	  return arg.endsWith('?') ? expanded.slice(0, -1) + '()' : expanded
	}
}


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
	  	}
		}
	}
	return hasData ? nodeData : undefined
}


module.exports = {extractNodeData}