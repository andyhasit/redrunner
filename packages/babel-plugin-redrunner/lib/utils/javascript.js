/**
 * Funtionality for working with JavaScript
 */
const {EOL} = require('./constants')


function isFunc(def) {
	return typeof def === 'function'
}

function isUnd(def) {
	return def === undefined
}

function splitTrim(str, char) {
	return str.split(char).map(item => item.trim())
}

function capitalize(str) {
	return str.charAt(0).toUpperCase() + str.slice(1)
}

module.exports = {
	capitalize,
	isFunc,
	isUnd,
	splitTrim
}
