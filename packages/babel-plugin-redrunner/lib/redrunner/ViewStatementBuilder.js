const c = console
const {EOL} = require('../utils/constants')
const {groupArray} = require('../utils/javascript')
const {DOMWalker} = require('./DOMWalker.js')
const {extractNodeData} = require('./extractNodeData')
const {buidlCallbackStatement, expandProperty} = require('./syntax')
const {
  ArrayStatement,
  FunctionStatement,
  ObjectStatement,
  ValueStatement
} = require('./StatementBuilders')

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

    // These are used in the buildMethod
    this.domObject = new ObjectStatement()
    this.beforeSave = []
    this.afterSave = []

    // These objects build the statements.
    this.buildMethod = new FunctionStatement('view, prototype')
    this.watchCallbacks = new ArrayStatement()
    this.watchQuery = new ObjectStatement()
  }
  /**
   * Initiates parsing and returns all the generated statements.
   */
  buildStatements() {
  	this.walker.parse()expandProperty
  	this.consolidate()
  	const prefix = `${this.className}.prototype.`
		return [
			this.watchCallbacks.buildAssign(`${prefix}__wc`),
			this.watchQuery.buildAssign(`${prefix}__wq`),
			this.buildMethod.buildAssign(`${prefix}__bv`),
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
    if (nodeData) {
      let {afterSave, beforeSave, saveAs, watches} = nodeData
      saveAs = saveAs ?  saveAs : this.getUniqueVarName()
      this.saveDOM(nodePath, saveAs, nodeData)

      // Squash array to object
      watches = groupArray(watches, 'property', watch => {
      	let {converter, target, raw} = watch
      	return buidlCallbackStatement(saveAs, converter, target, raw) // TODO: extract this
      })

      let callbacks = new ObjectStatement()
      for (let [property, statements] of Object.entries(watches)) {
      	this.addWatchQuery(property)
      	let callback = new FunctionStatement('n, o')
      	statements.forEach(s => callback.add(s))
        callbacks.add(property, callback)
      }
      let watchCallback = new ObjectStatement()
      //watchCallback.add('wrapper', saveAs)
      watchCallback.add('shield', 0)
      watchCallback.add('callbacks', callbacks)
      this.watchCallbacks.add(watchCallback)
    }
  }
  addWatchQuery(property) {
  	// TODO: also initiate the previous values object?
    if (property !== '*') {
      let callback = (property === '' || property === undefined) ?
      	'function() {return null}' :
      	`function() {return ${expandProperty(property)}}`
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