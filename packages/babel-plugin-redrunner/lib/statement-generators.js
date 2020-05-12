
const {
  EOL,
  htmlparse,
  saveAsAttName,
  argsAttName,
  redrunnerAtts
} = require('./constants');

const {
  extractAttributeValue,
  extractWholeAttribute,
  cleanHtml,
  findNextClosingTagOrWhiteSpace,
  unquotedAttEnd
} = require('./utils');

/** Generates the statement adding the build method to the class
 */
function theBuildMethod(className, htmlString) {
  let functionBody = generateBuildFunctionBody(htmlString)
  
}

/** Generates the statement adding the watchers property to the class
 */
function theWatchProperty(className, htmlString) {
  let functionBody = generateBuildFunctionBody(htmlString)
  return [`${className}.prototype._watchers_ = {`, functionBody, '};'].join(EOL)
}


/** Generates the source code of the build method. See integration tests for example outputs.
 */
function generateBuildFunctionLines(className, htmlString) {
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
        // We need to name itbuildStatements
        let randVar = getRandVarName()
        nestedComponentLines.push(`let ${randVar} = ${constructorStr};`)
        domObjectLines.push(`${saveAs}: ${randVar},`)
        nestedComponentLines.push(`m._lu_([${stack.slice(2)}]).replace(${randVar}.root.e);`)
      } else {
        // create class without saving.
        nestedComponentLines.push(`m._lu_([${stack.slice(2)}]).replace(${constructorStr}.root.e);`)
      }
    } else if (saveAs) {
      // The last entry's comma gets removed by babel later, so no need to here
      domObjectLines.push(`${saveAs}: m._lu_([${stack.slice(2)}]),`) 
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
  
  return lines
}


function generateBuildFunction(className, htmlString) {
  let lines = generateBuildFunctionLines(className, htmlString)
  return [`${className}.prototype._build_ = function(m, wrap){`, lines.join(EOL), '};'].join(EOL)
}

// Maybe use this?
// function buildPrototypeStatement(className, name, signature, body) {
//   let functionBody = generateBuildFunctionBody(htmlString)
//   return [`${className}.prototype.${name} = function(m, wrap){`, functionBody, '};'].join(EOL)
// }


/** Generate all the additional statements for the component.
 */
function generateStatements(componentData) {
  return [
    generateBuildFunction(componentData.className, componentData.htmlString)
  ]
}

module.exports = {generateStatements}