const {
  EOL,
  c,
  htmlparse,
  redrunnerAtts
} = require('./constants');

const {
  addPrototypeFunction,
  addPrototypeObject,
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

    // Add remaining lines (must come before dom!)
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
    const lines = []
    for (let [key, value] of Object.entries(this.watchItems)) {
      lines.push(`'${key}': [`)
      value.forEach(e => lines.push(e))
      lines.push(`],`)
    }
    if (lines.length) {
      const body = lines.join(EOL)
      this.watchStatement = addPrototypeObject(this.className, '_watch_', body)
    }
  }
  processComponentNode(nodePath, node, tagName) {
    // let {args, saveAs} = getNodeSpec(node)
    // const constructorStr = args? `m.box(${tagName}, ${args})` : `m.box(${tagName})`; 
    // if (saveAs) {
    //   const randVar = this.getRandVarName()
    //   this.buildMethodLines.push(`let ${randVar} = ${constructorStr};`)
    //   this.domObjectLines.push(`${saveAs}: ${randVar},`)
    //   this.buildMethodLines.push(`m.${this.lookupCall(nodePath)}.replace(${randVar}.root.e);`)
    // } else {
    //   this.buildMethodLines.push(`m.${this.lookupCall(nodePath)}.replace(${constructorStr}.root.e);`)
    // }
    let {args, saveAs} = getNodeSpec(node)
    const lines = this.buildMethodLines
    const constructorStr = args? `m.box(${tagName}, ${args})` : `m.box(${tagName})`;
    
    if (saveAs) {
      lines.push(`let ${saveAs} = ${constructorStr};`)
      lines.push(`m._rn_(${this.lookupArgs(nodePath)}, ${saveAs});`)
      this.domObjectLines.push(`${saveAs}: ${saveAs},`)
    } else {
      lines.push(`m._rn_(${this.lookupArgs(nodePath)}, ${constructorStr});`)
    }
  }
  processNormalNode(nodePath, node, tagName) {
    let {saveAs, watch} = getNodeSpec(node)
    if (watch) {
      saveAs = saveAs ?  saveAs : this.getRandVarName()
      this.addNodeWatch(watch, saveAs)
    }
    if (saveAs) {
      this.domObjectLines.push(`${saveAs}: m.${this.lookupCall(nodePath)},`)
    }
  }
  /* Returns a call to _lu_, which finds the node references by its tree index (e.g. [1, 0]) */
  lookupCall(nodePath) {
    return `_lu_(${this.lookupArgs(nodePath)})`
  }
  lookupArgs(nodePath) {
    return `[${nodePath.slice(2)}]`
  }
  addNodeWatch(watch, name) {
    /*
    'count': [
      function(n, o) {
        this._lu_([0]).text(n)
      },
      
      with target but no convert:
        this._lu_([0]).text(n)
      with target and convert:
        this._lu_([0]).text(convert(n, o))
      no target (implies convert):
        convert(n, o, w)
      }
    ]
    */
    let  callbackStatement, callbackBody, wrapper = `this.dom.${name}`
    if (watch.target) {
      if (watch.convert) {
        callbackBody = `${wrapper}.${watch.target}(${watch.convert}(n, o))`
      } else {
        callbackBody = `${wrapper}.${watch.target}(n)`
      }
    } else {
      // assume convert
      callbackBody = `${watch.convert}(n, o, ${wrapper})`
    }
    callbackStatement = ['function(n, o) {', callbackBody, '},'].join(EOL)
    this.getWatchItems(watch.name).push(callbackStatement)
  }
  // Return array
  getWatchItems(name) {
    if (!this.watchItems.hasOwnProperty(name)) {
      this.watchItems[name] = []
    }
    return this.watchItems[name]
  }
  getRandVarName() {
    this.randVarCount ++
    return '__' + this.randVarCount
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