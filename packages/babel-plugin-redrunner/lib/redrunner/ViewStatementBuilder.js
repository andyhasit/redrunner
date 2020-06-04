const {DOMWalker} = require('./DOMWalker.js')
const {extractNodeData} = require('./parse-node')
const {
  ArrayStatement,
  FunctionStatement,
  ObjectStatement,
  ValueStatement
} = require('./statement-builders')

/**
 * Builds all the generated statements for a RedRunner View.
 */
class ViewStatementBuilder {
  constructor(viewData) {
    this.walker = new DOMWalker(viewData.html,
    	(nodePath, node, tagName) => this.processNode(nodePath, node, tagName)
    )
    this.className = viewData.className
    this.config = viewData.config
    this.randVarCount = 0

    // These objects build the statements.
    this.buildMethod = new FunctionStatement('view, prototype')
    this.domObject = new ObjectStatement()
    this.watchCallbacks = new ArrayStatement()
    this.watchQuery = new ObjectStatement()
  }
  /**
   * Initiates parsing and returns all the generated statements.
   */
  buildStatements() {
  	this.walker.parse()
  	this.consolidate()
  	const prefix = `${this.className}.prototype.`
		return [
			this.watchCallbacks.buildAssign(`${prefix}__wc`),
			this.watchQuery.buildAssign(`${prefix}__wq`),
			this.buildMethod.buildAssign(`${prefix}__bd`),
		]
	}
	/**
	 * Consolidate any work after parsing
	 */
	consolidate() {
		this.beforeSave.forEach(i => this.buildMethod.add(i))
		this.buildMethod.add = this.domObject.buildAssign('view.dom')
		this.afterSave.forEach(i => this.buildMethod.add(i))
	}
  /**
   * Gets passed to the DOMWalker, who calls this at every node.
   * Simply punts the call to the appropriate method depending on node type.
   */
  processNode(nodeInfo) {
  	const isTagCapitalized = /[A-Z]/.test(nodeInfo.tagName[0])
    const processFunction = isTagCapitalized ? this.processViewNode : this.processNormalNode
    processFunction.apply(this, [nodeInfo])
  }
  processViewNode(nodeInfo) {
  	const {nodePath, node, tagName} = nodeInfo
    // let {props, saveAs} = findRedRunnerAtts(node)
    // const lines = this.buildMethodLines
    // const constructorStr = props? `view.nest(${tagName}, ${props})` : `view.nest(${tagName})`;
    // if (saveAs) {
    //   lines.push(`let ${saveAs} = ${constructorStr};`)
    //   lines.push(`view.__rn(${lookupArgs(nodePath)}, ${saveAs});`)
    //   this.domObjectLines.push(`${saveAs}: ${saveAs},`)
    // } else {
    //   lines.push(`view.__rn(${lookupArgs(nodePath)}, ${constructorStr});`)
    // }
  }
  processNormalNode(nodeInfo) {
  	const {nodePath, node, tagName} = nodeInfo
    const nodeData = extractNodeData(node, this.config, this.walker)
    const callbacks = {}
    if (nodeData) {
      let {afterSave, beforeSave, saveAs, watches} = nodeData
      saveAs = saveAs ?  saveAs : this.getUniqueVarName()
      watches.forEach(watch => {
        let {property, converter, target, raw} = watch
        // Add watch query (idempotent)
        this.addWatchQuery(property)

        // Squash statements for all callbacks into one function.
        let statement = buidlCallbackStatement(saveAs, converter, target, raw)
        if (!callbacks.hasOwnProperty(property)) {
          callbacks[property] = []
        }
        callbacks[property].push(statement)
      })

      for (let [property, statements] of Object.entries(callbacks)) {
        let functionLines = statements.join(EOL)
        let functionString = ['function(n, o) {', functionLines, '},'].join(EOL)
        callbacks[property] = functionString
      }
      this.watchCallbacks.add({wrapper:saveAs, shield: 0, callbacks: callbacks})
      this.saveDOM(nodePath, saveAs, nodeData)
    }
  }
  addWatchQuery(property) {
  	// TODO: also initiate the previous values object?
    if (property !== '*') {
      let callback = (property === '' || property === undefined) ?
      	'function() {return null}' :
      	`function() {return ${expandShorthand(property)}}`
      this.watchQuery.add(property, callback)
    }
  }
  /**
   * Add an entry to the DOM creation object.
   */
  saveDOM(nodePath, saveAs, nodeData) {
    let {chainedCalls} = nodeData
    const wrapperInit = nodeData.wrapperInit(nodePath)
    const chainedCallStatement = chainedCalls.join('.')
    this.domObject.add(saveAs, `${wrapperInit}${chainedCallStatement}`)
  }
  getUniqueVarName() {
    this.randVarCount ++
    return '__' + this.randVarCount
  }
}

module.exports = {ViewStatementBuilder}