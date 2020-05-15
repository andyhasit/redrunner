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
    const lines = ['view.root = wrap(`' + removeRedRunnerCode(this.strippedHtml) + '`);']

    // Add remaining lines (must come before dom!)
    this.buildMethodLines.forEach(n => lines.push(n))

    // Add this.dom definition
    if (this.domObjectLines.length > 0) {
      lines.push('view.dom = {')
      this.domObjectLines.forEach(n => lines.push(n))
      lines.push('};')
    } else {
      lines.push('view.dom = {};')
    }
    const body = lines.join(EOL)
    this.buildStatement = addPrototypeFunction(this.className, '__bv', 'view, wrap', body)
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
      this.watchStatement = addPrototypeObject(this.className, '__wc', body)
    }
  }
  processComponentNode(nodePath, node, tagName) {
    let {args, saveAs} = getNodeSpec(node)
    const lines = this.buildMethodLines
    const constructorStr = args? `view.nest(${tagName}, ${args})` : `view.nest(${tagName})`;
    
    if (saveAs) {
      lines.push(`let ${saveAs} = ${constructorStr};`)
      lines.push(`view.__rn(${this.lookupArgs(nodePath)}, ${saveAs});`)
      this.domObjectLines.push(`${saveAs}: ${saveAs},`)
    } else {
      lines.push(`view.__rn(${this.lookupArgs(nodePath)}, ${constructorStr});`)
    }
  }
  processNormalNode(nodePath, node, tagName) {
    let {saveAs, watch} = getNodeSpec(node)
    if (watch) {
      saveAs = saveAs ?  saveAs : this.getRandVarName()
      this.addNodeWatch(watch, saveAs)
    }
    if (saveAs) {
      this.domObjectLines.push(`${saveAs}: view.${this.lookupCall(nodePath)},`)
    }
  }
  /* Returns a call to __gw, which finds the node references by its tree index (e.g. [1, 0]) */
  lookupCall(nodePath) {
    return `__gw(${this.lookupArgs(nodePath)})`
  }
  lookupArgs(nodePath) {
    return `[${nodePath.slice(2)}]`
  }
  addNodeWatch(watch, name) {
    /*
    'count': [
      function(n, o) {
        this.__gw([0]).text(n)
      },
      
      with target but no convert:
        this.__gw([0]).text(n)
      with target and convert:
        this.__gw([0]).text(convert(n, o))
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
      // assume convert is provided
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