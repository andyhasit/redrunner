
const {getAttVal} = require('../utils/dom')



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



/*

this.dom.__4.css(this.foo);
foo(n, o, this.dom.__5);

*/

function standardCallback(property, converter, target) {

}



