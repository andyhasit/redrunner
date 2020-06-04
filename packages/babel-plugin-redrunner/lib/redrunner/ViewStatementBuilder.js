const c = console
const {EOL} = require('../utils/constants')
const {stripHtml} = require('../utils/dom')
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
    this.walker = new DOMWalker(viewData.html, nodeInfo => this.processNode(nodeInfo))
    this.className = viewData.className
    this.clone = viewData.clone
    this.config = viewData.config
    this.randVarCount = 0

    // These are used in the buildMethod
    this.domObject = new ObjectStatement()
    this.beforeSave = []
    this.afterSave = []

    // These objects build the statements.
    this.htmlString = new ValueStatement()
    this.buildMethod = new FunctionStatement('view, prototype')
    this.watchCallbacks = new ArrayStatement()
    this.watchQuery = new ObjectStatement()
  }
  /**
   * Initiates parsing and returns all the generated statements.
   */
  buildStatements() {
  	this.walker.parse()
  	this.postParsing()
  	const prefix = `${this.className}.prototype.`
		const statements = [
			this.htmlString.buildAssign(`${prefix}__ht`),
			this.watchCallbacks.buildAssign(`${prefix}__wc`),
			this.watchQuery.buildAssign(`${prefix}__wq`),
			this.buildMethod.buildAssign(`${prefix}__bv`),
		]
		if (this.clone) {
			statements.push(new ValueStatement('undefined').buildAssign(`${prefix}__cn`))
		}
		return statements
	}
	/**
	 * Consolidates various bits after parsing.
	 */
	postParsing() {
		this.buildMethod.add(`view.__bd(prototype, ${this.clone})`)
		this.beforeSave.forEach(i => this.buildMethod.add(i))
		this.buildMethod.add(this.domObject.buildAssign('view.dom'))
		this.afterSave.forEach(i => this.buildMethod.add(i))
		// We do this at the end as the dom has been changed
		this.htmlString.set(`'${stripHtml(this.walker.dom.toString())}'`)
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
      let watchCallback = new ObjectStatement({
      	el: `'${saveAs}'`,
      	shield: 0,
      	callbacks: callbacks
      })
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
    const chainedCallStatement = chainedCalls.length ? '.' + chainedCalls.join('.') : ''
    this.domObject.add(saveAs, `${wrapperInit}${chainedCallStatement}`)
  }
  getUniqueVarName() {
    this.randVarCount ++
    return '__' + this.randVarCount
  }
}

module.exports = {ViewStatementBuilder}