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

/*
 * Converts an array of objects to one object with arrays.
 *
 * in:  [{k: 'a', ...}, {k: 'b', ...}]
 * out: {a: [...], b: [...]}
 */
function groupArray(ar, key, f) {
	const obj = {}
	ar.forEach(i => {
		let k = i[key]
		if (!obj.hasOwnProperty(k)) {
      obj[k] = []
    }
    obj[k].push(f(i))
	})
	return obj
}

module.exports = {
	capitalize,
	groupArray,
	isFunc,
	isUnd,
	splitTrim
}
