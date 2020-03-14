/*
The functions which actually do the work
*/
const EOL = require('os').EOL;
const htmlparse = require('node-html-parser');
const c = console;


/** Generates the statement adding the build method to the class
 */
function buildStatement(className, htmlString) {
  let functionBody = generateBuildFunctionBody(htmlString)
  return [`${className}.prototype.__build = function(m, wrap){`, functionBody, '};'].join(EOL)
}

/** Generates the source code of the build method.
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
    let saveAs = extractSaveAsName(node.rawAttrs)
    let tagName = node.tagName

    if (tagName && /[A-Z]/.test(tagName[0])) {
      // We have a nested component
      let argsStr = extractArgsStr(node.rawAttrs)
      let constructorStr = `m.box(${tagName})`
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
      // the last comma is magically removed by babel
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


/** Extracts the name from rawAttrs (e.g. 'as:count class="danger"' > 'count')
 */
function extractSaveAsName(rawAttrs) {
  if (rawAttrs) {
    let match = rawAttrs.split(' ').find(el => el.startsWith('as:'))
    if (match) {
      return match.substr(3)
    }
  }
}

/** Extracts the args string from rawAttrs (e.g. 'args="a, b"' > 'a, b')
 */
function extractArgsStr(rawAttrs) {
  if (rawAttrs) {
    let start = rawAttrs.indexOf('args=')
    if (start >= 0) {
      let firstQuotePosition = start + 5
      let quoteSymbol = rawAttrs[firstQuotePosition] // ' or "
      let lastQuotePosition = rawAttrs.indexOf(quoteSymbol, start + 6)
      return rawAttrs.substring(start + 6, lastQuotePosition)
    }
  }
}

/** Find locations of text in string
 */
function findLocations(html) {
  var regexp = / as:/g;
  var match, locations = [];
  while ((match = regexp.exec(html)) != null) {
    locations.push(match.index);
  }
  return locations
}

/** Find where to cut, i.e. position of next '>' or ' ' whichever comes first
 *  Should probably include all whitespace.
 */
function findCut(html, start) {
  let cut, nextSpace = html.indexOf(' ', start + 1), nextClosingTag = html.indexOf('>', start);
  if (nextSpace == -1) {
    cut = nextClosingTag
  } else if (nextClosingTag == -1) {
    cut = nextSpace
  } else {
    cut = (nextSpace > nextClosingTag)? nextClosingTag : nextSpace;
  }
  return cut
}

/** Strips redrunner tags from html
 */
function cleanHtml(html) {
  let remove = [], locations = findLocations(html)
  locations.forEach(loc => {
    let cut = findCut(html, loc)
    remove.push(html.substring(loc, cut))
  })
  remove.forEach(w => html = html.replace(w, ''))
  return html
}


/* Exporting everything we want to test because TDD */
module.exports = {
  buildStatement,
  extractArgsStr,
  extractSaveAsName,
  cleanHtml,
  findCut,
  findLocations,
  generateBuildFunctionBody
}