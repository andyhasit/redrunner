/*
The functions which actually do the work
*/
const EOL = require('os').EOL
const htmlparse = require('node-html-parser')
const c = console

/* The RedRunner attributes */
const saveAsAttName = 'as'
const argsAttName = 'args'
const redrunnerAtts = [saveAsAttName, argsAttName]

/** Generates the statement adding the build method to the class
 */
function buildStatement(className, htmlString) {
  let functionBody = generateBuildFunctionBody(htmlString)
  return [`${className}.prototype.__build = function(m, wrap){`, functionBody, '};'].join(EOL)
}

/** Generates the source code of the build method. See integration tests for example outputs.
 */
function generateBuildFunctionBody(htmlString) {
  let strippedHtml = htmlString.replace(/\n/g, "")
    .replace(/[\t ]+\</g, "<")
    .replace(/\>[\t ]+\</g, "><")
    .replace(/\>[\t ]+$/g, ">")

  let nestedComponentLines = []
  let domObjectLines = []
  let stack = []
  let randVarCount = 0

  function getRandVarName() {
    randVarCount ++
    return 'rrr' + randVarCount
  }

  function processNode(node, i) {
    stack.push(i)
    let saveAs = extractAttributeValue(node.rawAttrs, saveAsAttName)
    let tagName = node.tagName

    if (tagName && /[A-Z]/.test(tagName[0])) {
      // We have a nested component
      let argsStr = extractAttributeValue(node.rawAttrs, argsAttName)
      let constructorStr = argsStr? `m.box(${tagName}, ${argsStr})` : `m.box(${tagName})`;      
      if (saveAs) {
        // We need to name it
        let randVar = getRandVarName()
        nestedComponentLines.push(`let ${randVar} = ${constructorStr};`)
        domObjectLines.push(`${saveAs}: ${randVar},`)
        nestedComponentLines.push(`m.__lookup([${stack.slice(2)}]).replace(${randVar}.root.e);`)
      } else {
        // create class without saving.
        nestedComponentLines.push(`m.__lookup([${stack.slice(2)}]).replace(${constructorStr}.root.e);`)
      }
    } else if (saveAs) {
      // The last entry's comma gets removed by babel later, so no need to here
      domObjectLines.push(`${saveAs}: m.__lookup([${stack.slice(2)}]),`) 
    }

    node.childNodes.forEach(processNode)
    stack.pop()
  }
  let dom = htmlparse.parse(strippedHtml)
  processNode(dom)

  // Build function body line by line
  let lines = ['m.root = wrap(`' + cleanHtml(strippedHtml) + '`);']

  nestedComponentLines.forEach(n => lines.push(n))
  
  if (domObjectLines.length > 0) {
    lines.push('m.dom = {')
    domObjectLines.forEach(n => lines.push(n))
    lines.push('};')
  } else {
    lines.push('m.dom = {};')
  }
  
  return lines.join(EOL)
}


/** Extracts the args string from rawAttrs e.g. 
 *
 *   as=m > "m"
 *   args="a, 'b'" > "a, 'b'"
 *
 *  Note that it does not allow spaces around the = sign!
 */
function extractAttributeValue(attStr, attName) {
  if (attStr) {
    let withEqualSign = attName + '='
    let start = attStr.search(withEqualSign)
    if (start >= 0) {
      attStr = attStr.substr(start + withEqualSign.length)
      let quoteSymbol = attStr[0]
      if (quoteSymbol == '"' || quoteSymbol == "'") {
        // Its in quotes...
        return attStr.substr(1, attStr.indexOf(quoteSymbol, 1) - 1)
      } else {
        // Not in quotes
        return attStr.substr(0, findNextClosingTagOrWhiteSpace(attStr, 0))
      }
    }
  }
}

/** Extracts the whole attribute (e.g. "as=me" from rawAttrs
 *  Note that it does not allow spaces around the = sign!
 */
function extractWholeAttribute(attStr, attName) {
  if (attStr) {
    let withEqualSign = attName + '='
    let valueStartIndex = withEqualSign.length + 1
    let start = attStr.search(withEqualSign)
    if (start >= 0) {
      attStr = attStr.substr(start)
      let quoteSymbol = attStr[valueStartIndex - 1]
      if (quoteSymbol == '"' || quoteSymbol == "'") {
        // Its in quotes...
        return attStr.substr(0, attStr.indexOf(quoteSymbol, valueStartIndex) + 1)
      } else {
        // Not in quotes
        return attStr.substr(0, findNextClosingTagOrWhiteSpace(attStr, 0))
      }
    }
  }
}

/** Strips redrunner tags from html
 */
function cleanHtml(html) {
  // Function called recursively on nodes.
  function processNode(node, i) {
    let attStr = node.rawAttrs
    if (attStr) {
      node.rawAttrs = removeRedRunnerAttributes(attStr)
    }
    node.childNodes.forEach(processNode)
  }
  let dom = htmlparse.parse(html)
  processNode(dom)
  return dom.toString()
}

/** Find locations of text in string
 */
function removeRedRunnerAttributes(attStr) {
  redrunnerAtts.forEach(att => {
    let wholeAtt = extractWholeAttribute(attStr, att)
    attStr = attStr.replace(wholeAtt, '')
  })
  // Just trimming extraneous whitespace
  return attStr.split(' ').filter(s => s.length).join(' ')
}

/** Find where to cut, i.e. position of next '>' or ' ' whichever comes first.
 * str at posttion start must not start with whitespace.
 */
function findNextClosingTagOrWhiteSpace(s, start) {
  if (start == undefined) {
    start = 0
  }
  let nextWhiteSpace = findNextWhiteSpace(s, start)
  let nextClosingTag = findNextClosingTag(s, start)
  if (nextWhiteSpace == undefined) {
    return nextClosingTag
  } else if (nextClosingTag == undefined) {
    return nextWhiteSpace
  } else {
    return (nextWhiteSpace > nextClosingTag)? nextClosingTag : nextWhiteSpace
  }
}


function findNextWhiteSpace(s, start) {
  let index = s.substr(start).search(/\s+/)
  if (index >= 0) {
    return index + start
  }
}

function findNextClosingTag(s, start) {
  let index = s.substr(start).search('>')
  if (index >= 0) {
    return index + start
  }
}


/* Exporting everything we want to test too because changing the above is
 * quicker using TDD 
 */
module.exports = {
  buildStatement,
  extractAttributeValue,
  extractWholeAttribute,
  cleanHtml,
  generateBuildFunctionBody,
  findNextClosingTagOrWhiteSpace
}