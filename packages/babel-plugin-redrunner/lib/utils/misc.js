/**
 * Funtionality for working with JavaScript
 */
const {EOL} = require('./constants')


const isFunc = (def) => typeof def === 'function'

const isUnd = (def) => def === undefined

const splitTrim = (str, char) => str.split(char).map(item => item.trim())

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1)

/*
 * Converts an array of objects to one object with arrays.
 *
 * in:  [{k: 'a', ...}, {k: 'b', ...}]
 * out: {a: [...], b: [...]}
 */
const groupArray = (ar, key, f) => {
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


const arrayStartsWith = (origin, test) => {
  if (test.length <= origin.length) {
    return false
  }
  for (const [i, v] of origin.entries()) {
    if (test[i] !== v) {
      return false
    }
  }
  return true
}


/*
 * Given an array of nodeIndexPaths such as
 *
 *   [
 *     [0],
 *     [0, 1],
 *     [0, 2],
 *     [1],
 *   ]
 *
 * It returns an array the number of nested items, like so:
 *
 *  [2, 0, 0, 0]
 *
 *
 */
const extractShieldCounts = (paths) => {
  const processedPaths = []

  paths.forEach(path => {
    processedPaths.forEach(processed => {
      if (arrayStartsWith(processed.path, path)) {
        processed.count ++
      }
    })
    processedPaths.push({path: path, count: 0})
  })
  return processedPaths.map(i => i.count)
}

module.exports = {
  arrayStartsWith,
  capitalize,
  extractShieldCounts,
  groupArray,
  isFunc,
  isUnd,
  splitTrim
}
