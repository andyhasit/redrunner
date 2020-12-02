/**
 * This module deals with parsing inline directives and building the 
 * watch objects.
 */
const {splitter} = require('../constants')
const {extractAtts, isLeafNode, removeAtt} = require('../utils/dom')
const {escapeSingleQuotes, clearIfEmpty} = require('../utils/misc')
const {config} = require('../config')

// Settings for inline directives
const [startDelimiter, endDelimiter] = config.options.inlineDelimiters

if (startDelimiter.length !== 1 || endDelimiter .length !== 1) {
  throw new Error('Configuration error: start and end delimiters must be single characters.')
}
// Currently on works if length is 1!
//const delimiterLength = startDelimiter.length

/**
 * Finds the inline calls and adds watches. Also modifies the
 * actual node object to remove inline call code.
 *
 * Notes:
 *
 *  - It only detects the first inline call in a given string
 *  - Text detection only works with leaf nodes
 *
 * TODO: resolve or throw warnings for the above cases!
 *
 * @param {node} node A node from babel.
 *
 * @return {number} An array of watch objects as [{name, converter, wrapperMethod}...]
 */
const processInlineWatches = (nodeData, node, config) => {
  const atts = extractAtts(node)
  const restrictedAtts = Object.values(config.directives)

  if (isLeafNode(node)) {
    if (addInlineWatches(nodeData, node.innerHTML, 'text')) {
      node.innerHTML = ''
    }
  }

  // Look at child nodes too.
  // console.log(node, node.nodeType, node.innerHTML)
  // node.childNodes.forEach(n => {
  //   console.log(n.nodeType)
  // })
  // console.log('--------------')
  // extract from node's text
  // set textContent = ''

  // extract from node's attributes
  for (let [key, value] of Object.entries(atts)) {
    if (value && !restrictedAtts.includes(key)) {
      // Use @ notation which is handled downstream, unless it's class in which case we use css()
      key = key == 'class' ? 'css' : `@${key}`
      if (addInlineWatches(nodeData, value, key)) {
        removeAtt(node, key)
      }
    }
  }
}


/**
 * Adds watches as {property, wrapperArgString, wrapperMethod} to
 * nodeData.watches, where wrapperArgString is a string which will be used in a
 * watch callback's call to the wrapper method.
 * 
 * function (n, o, w, p, c) {
 *   // Line goes here
 * }
 * 
 * Line could be:
 * 
 *  w.text(n);
 *  w.text(c.foo(n, o, w, p, c));
 * 
 * If multiple properties are watched, we move the logic to a lookup:
 * 
 * {
 *  foo: function(n, o, w, p, c) {
 *     return 'Hi ' + p.name + ' it is ' + p.date;
 *   }
 * }
 * 
 * And call that:
 * 
 *  w.text(c.lookup('foo'));
 * 
 * Because we don't want to duplicate that code in both callbacks.
 */
const addInlineWatches = (nodeData, inlineText, wrapperMethod) => {
  const {watchedProperties, chunks} = parseInlineText(inlineText)
  const watchedPropertyCount = watchedProperties.length
  if (watchedPropertyCount === 0) {
    return false
  }
  if (watchedPropertyCount === 1) {
    let watch = watchedProperties[0]
    let converter = buildConcatStatement(nodeData, chunks, expandChunkConverterSingleMode)
    // Put in brackets so it is treated as raw JS.
    converter = `(${converter})`
    nodeData.addWatch(watch, converter, wrapperMethod)
  } else {

    //let converter = buildConcatStatement(nodeData, chunks, expandChunkConverterMultipleMode)
    
    // Create a function and add multiple watches
    //TODO: build this  up
    //{wrapperMethod, inlineRaw}
  }
  return true
}

/**
 * Builds a javascript string concatenating the chunks, which are a mix of 
 * strings and directives.
 * 
 * @param {Array} nodeData 
 * @param {Array} chunks 
 * @param {Function} expander 
 */
const buildConcatStatement = (nodeData, chunks, expander) => {
  chunks = chunks.map(chunk => {
    if (typeof chunk == 'object') {
      return expander(nodeData, chunk)
    } else {
      return `'${escapeSingleQuotes(chunk)}'`
    }
  })

  // We now want to strip (or even remove if blank) the first and last
  // chunks if they are text. Don't strip anything else!
  
  const chunkCount = chunks.length
  const firstItem = chunks[0]
  const lastItem = chunks[chunkCount - 1]
  if (typeof firstItem == 'string') {
    chunks[0] = trimIfQuoted(firstItem, 'trimStart')
  }
  if (typeof lastItem == 'string') {
    chunks[chunkCount - 1] = trimIfQuoted(lastItem, 'trimEnd')
  }
  return chunks.filter(c => c).join('+')
}

/**
 * Will trim the start or end of a string if it is a quoted string "'like this '"
 * 
 * If string is not quoted, returns as is.
 * If string is quoted but contains only whitespace, returns undefined.
 * 
 * @param {string} chunk 
 * @param {string} trimMethod - trimEnd or trimStart
 */
const trimIfQuoted = (chunk, trimMethod) => {
  if (chunk.startsWith("'")) {
    const trimmed = chunk.slice(1, -1)[trimMethod]()
    if (trimmed.length > 0 ) {
      return "'" + trimmed + "'"
    }
    return undefined // we want this.
  }
  return chunk
}

/**
 * Expands a directive chunk in single mode, i.e. only one watched value,
 * which is already available as 'n'.
 * 
 * @param {Object} nodeData 
 * @param {Object} directiveChunk -- a chun
 */
const expandChunkConverterSingleMode = (nodeData, directiveChunk) => {
  if (directiveChunk.converter) {
    return nodeData.expandValueSlot(directiveChunk.converter)
  } else {
    return 'n'
  }
}

/**
 * Expands a directive chunk in single mode, i.e. only one watched value,
 * which is already available as 'n'.
 * 
 * @param {Object} nodeData 
 * @param {Object} directiveChunk -- a chun
 */
const expandChunkConverterMultipleMode = (nodeData, directiveChunk) => {
  if (directiveChunk.converter) {
    return nodeData.expandValueSlot(directiveChunk.converter)
  } else {
    return 'n'
  }
}

/**
 * Parses a piece of text, returning an object {watchedProperties, chunks}.
 * 
 * This:
 *
 *  "Hello {firstname|capitalise} it's {date}" 
 * 
 * Becomes:
 * 
 *   {
 *     watchedProperties: {firstname: true, date: true},
 *     chunks: [
 *       "Hello ",
 *       {property: "firstname", converter: "capitalise"},
 *       " it's ",
 *       {property: "date", converter: undefined}
 *     ]
 *   }
 * 
 * @param {string} inlineText 
 */
const parseInlineText = (inlineText) => {
  let watchedProperties = []
  let chunks = []
  let nestedDepth = 0
  let currentChunk = ''

  const saveChunkAndStartNew = () => {
    if (currentChunk !== '') {
      chunks.push(currentChunk)
    }
    currentChunk = ''
  }

  const handleOpenBracket = (freeTextMode) => {
    if (freeTextMode) {
      currentChunk = currentChunk.slice(0, -1)
      saveChunkAndStartNew()
    }
    nestedDepth ++
  }

  const handleCloseBracket = (freeTextMode) => {
    if (freeTextMode) {
      throw new Error(`Encountered ${endDelimiter} in free text.`)
    } 
    if (nestedDepth === 1) {
      currentChunk = converterInline(currentChunk.slice(0, -1))
      let property = currentChunk.property
      if (! watchedProperties.includes(property)) {
        watchedProperties.push(property)
      }
      saveChunkAndStartNew()
    }
    nestedDepth --
  }

  const converterInline = (text) => {
    const [property, converter] = text.split(splitter).map(s => s.trim())
    return {property, converter}
  }

  for (let i=0, il=inlineText.length; i<il; i++) {
    let char = inlineText[i]
    currentChunk += char  // this may include the close or start bracket
    let freeTextMode = nestedDepth === 0
    if (char === startDelimiter) {
      handleOpenBracket(freeTextMode)
    } else if (char === endDelimiter) {
      handleCloseBracket(freeTextMode)
    }
  }
  saveChunkAndStartNew()
  return {watchedProperties, chunks}
}

module.exports = {processInlineWatches}