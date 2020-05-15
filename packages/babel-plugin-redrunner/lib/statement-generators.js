const {
  EOL,
  c,
  htmlparse,
  redrunnerAtts
} = require('./constants');

const {
  addPrototypeFunction,
  getAttVal,
  removeRedRunnerCode,
  findNextClosingTagOrWhiteSpace,
  stripHtml
} = require('./utils');

const {getNodeSpec} = require('./html-spec');


class ComponentProcessor {
  constructor(componentData) {
    let {className, htmlString} = componentData
    this.className = className
    this.strippedHtml = stripHtml(htmlString)
    this.buildMethodLines = []  // The method lines, as code
    this.domObjectLines = []    // The lines for this.dom = {}
    this.watchItems = {}
    this.randVarCount = 0

    // The final statements, as strings:
    this.buildStatement = undefined
    this.watchStatement = undefined
  }
  processComponent() {
    this.parseHtmlProperty()
    //this.parseWatchProperty() ...?

    this.createBuildStatement() 
    this.createWatchStatement()  
  }
  parseHtmlProperty() {
    const self = this
    // Recursively processes each node in the DOM
    function processNode(node, i) {
      nodePath.push(i)
      const tagName = node.tagName
      if (tagName) {
        const isCapitalized = /[A-Z]/.test(tagName[0])
        const processFunction = isCapitalized ? self.processComponentNode : self.processNormalNode
        processFunction.apply(self, [nodePath, node, tagName])
      }
      node.childNodes.forEach(processNode)
      nodePath.pop()
    }
    
    const nodePath = []    // The path of current node recursion
    const dom = htmlparse.parse(this.strippedHtml)
    processNode(dom)
  }
  createBuildStatement() {
    const name = '_build_'
    const args = 'm, wrap'
    const lines = ['m.root = wrap(`' + removeRedRunnerCode(this.strippedHtml) + '`);']
    this.buildMethodLines.forEach(n => lines.push(n))

    // Add this.dom definition
    if (this.domObjectLines.length > 0) {
      lines.push('m.dom = {')
      this.domObjectLines.forEach(n => lines.push(n))
      lines.push('};')
    } else {
      lines.push('m.dom = {};')
    }

    const body = lines.join(EOL)
    this.buildStatement = addPrototypeFunction(this.className, name, args, body)
  }
  createWatchStatement() {

  }
  processComponentNode(nodePath, node, tagName) {
    const {args, saveAs} = getNodeSpec(node)
    const constructorStr = args? `m.box(${tagName}, ${args})` : `m.box(${tagName})`; 
    if (saveAs) {
      const randVar = this.getRandVarName()
      this.buildMethodLines.push(`let ${randVar} = ${constructorStr};`)
      this.domObjectLines.push(`${saveAs}: ${randVar},`)
      this.buildMethodLines.push(`m._lu_([${nodePath.slice(2)}]).replace(${randVar}.root.e);`)
    } else {
      this.buildMethodLines.push(`m._lu_([${nodePath.slice(2)}]).replace(${constructorStr}.root.e);`)
    }
  }
  processNormalNode(nodePath, node, tagName) {
    const {saveAs, watch} = getNodeSpec(node)
    if (watch) {
      c.log(watch)
    }
    if (saveAs) {
      this.domObjectLines.push(`${saveAs}: m._lu_([${nodePath.slice(2)}]),`)
    }
  }
  getRandVarName() {
    this.randVarCount ++
    return 'rrr' + this.randVarCount
  }
}


/** Returns the statements as a list of strings.
 */
function generateStatements(componentData) {
  const componentProcessor = new ComponentProcessor(componentData)
  componentProcessor.processComponent()
  statements = [componentProcessor.buildStatement]
  if (componentProcessor.watchStatement) {
    statements.push(componentProcessor.watchStatement)
  }
  return statements
}

module.exports = {generateStatements}