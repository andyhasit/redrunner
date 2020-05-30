
const {getAttVal} = require('../utils/dom')


config = {
	argParsers: {
		'property',
		'converter'
	},
	directives: {
	  ':visible': {
	    args: ['property', 'converter'],
	    actions: {
	      watch: {
	      	method: 'visible',
	      	args: 'n',
		  	},
	   	  shield: true // Shields nested wrappers from being updated
	   	}
	  },
	  ':watch': {
	  	args: ['property', 'converter', 'target'],
	  	callbacks: [],
	  }

	}
}

/*

A directive may be a function which returns an object, or an object containing
configuration.
/**
 * Return array of args based on definitions
 *
  - args
	- callbacks
	- wrapper
	- chains


*/

function standardCallback(args) {
	const [property, converter, target] = ...args
	return standardCallback(property, converter, target)
}


/**
 * Return array of args based on definitions
 *
 * @param {Array} params The parameters as strings or functions
 * @param {String} attVal The raw attribute value.
 */
function parseArgs(params, attVal) {
	const args = []
	const chunks = attVal.split('|')
  for (let i=0, il=params.length; i<il; i++) {
  	let param = params[i]
  	let raw = chunks[i]
  	let value = isFunc(param) ? param(value, i) : parseArgValue(param, raw, i)
  	args.push(value)
  }
  return args
}

/**
 * Parse individual arg.
 */
function parseArgValue(param, raw, i) {
	if (param.endsWith('!')) {
		if (isUnd(raw)) {
			throw new
		}
		param = param.substr(0, -1)
	}
	if (config.argParsers.hasOwnProperty(param)) {

	} else {

	}
}

function isFunc(def) {
	return typeof def === 'function'
}

/*

this.dom.__4.css(this.foo);
foo(n, o, this.dom.__5);

*/

function standardCallback(property, converter, target) {

}


/**
 * Adds data from the directive.
 */
function addDirectiveData(directiveName, conf, data, attVal, node) {
	let args
	if (typeof conf === 'function') {
    conf(data, attVal, node)
	} else {
		if (conf.hasOwnProperty('args')) {
			args = isFunc(conf.args) ? conf.args(attVal) : parseArgs(conf.args, attVal)
		} else {
			args = attVal
		}

	}
}

/**
 * Parses the directives in a node, returning an object or undefined.
 */
function parseDirectives(node) {
	const nodeAtts = node.rawAttrs
	if (nodeAtts && nodeAtts !== '') {
		const data = {}
		for (let [directiveName, directive] of Object.entries(config.directives)) {
	  	let attVal = getAttVal(nodeAtts, directiveName)
	  	if (attVal) {
	  		addDirectiveData(directiveName, directive, data, attVal, node)
	  	}
		}
		return data
	}
}


module.exports = {parseDirectives}