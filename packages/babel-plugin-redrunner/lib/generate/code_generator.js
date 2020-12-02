const {getLookupArgs, stripHtml} = require('../utils/dom')
const {escapeSingleQuotes, extractShieldCounts, groupArray, isUnd} = require('../utils/misc')
const {
  componentRefInBuild, 
  lookupCallbackArgs,
  propsCallbackArgs,
  watchCallbackArgs,
  watchCallbackArgsAlways
} = require('../constants')
const {DomWalker} = require('../parse/dom_walker.js')
const {extractNodeData} = require('../parse/parse_node')
const {
  ArrayStatement,
  CallStatement,
  FunctionStatement,
  ObjectStatement,
  ValueStatement
} = require('./statement_builders')
const {buildWatchCallbackBodyLine} = require('./watches')

const re_lnu = /^\w+$/; // letters_numbers_underscores

const vars = {
  prototypeVariable: 'p',
  getWatch: '__wa',
  getLookup: '__lu',
}

/**
 * Builds all the generated statements for a RedRunner View.
 * Deals with:
 *
 *  - Building the fields and methods for the prototype
 *  - Tracking state during the parsing (e.g. next DOMRef, and shielding)
 *
 * Does not deal with:
 *
 *  - generating JS from html syntax.
 */
class CodeGenerator {
  constructor(viewData, babelPath) {
    this.walker = new DomWalker(viewData.html, nodeInfo => this.processNode(nodeInfo))
    this.className = viewData.className
    this.babelPath = babelPath

    this.clone = viewData.clone
    this.processAsStub = viewData.processAsStub
    this.config = viewData.config
    this.nextElementRefIndex = 0
    this.savedWatchCallArgs = []

    // These are used in the buildMethod
    this.savedElements = new ObjectStatement()
    this.beforeSave = []
    this.afterSave = []

    // These objects build the statements.
    this.htmlString = new ValueStatement()
    this.buildMethod = new FunctionStatement(`${componentRefInBuild}, prototype`)
    this.watches = new ArrayStatement()
    this.protoLookupCallbacks = new ObjectStatement()
    this.nestedViewProps = new ObjectStatement()
    this.createLookupCall = new CallStatement(`${vars.prototypeVariable}.${vars.getLookup}`)
    this.createLookupCall.add(this.protoLookupCallbacks)
  }
  /**
   * Initiates parsing and returns all the generated statements.
   */
  buildStatements() {
    this.walker.parse()
    this.postParsing()
    const statements = [
      `var ${vars.prototypeVariable} = ${this.className}.prototype;`,
      this.htmlString.buildAssign(`${vars.prototypeVariable}.__ht`),
      this.watches.buildAssign(`${vars.prototypeVariable}.__wc`),
      this.createLookupCall.buildAssign(`${vars.prototypeVariable}.__qc`),
      this.nestedViewProps.buildAssign(`${vars.prototypeVariable}.__ip`),
      this.buildMethod.buildAssign(`${vars.prototypeVariable}.__bv`),
    ]
    if (this.clone) {
      statements.push(new ValueStatement('undefined').buildAssign(`${vars.prototypeVariable}.__cn`))
    }
    return statements.reverse()
  }
  /**
   * Consolidates various bits after parsing.
   */
  postParsing() {
    this.setShieldCounts()
    this.buildMethod.add(`${componentRefInBuild}.__bd(prototype, ${this.clone})`)
    this.beforeSave.forEach(i => this.buildMethod.add(i))
    this.buildMethod.add(this.savedElements.buildAssign(`${componentRefInBuild}.el`))
    this.afterSave.forEach(i => this.buildMethod.add(i))
    // We do this at the end as the dom has been changed
    const convertedHTML = this.buildHtmlString(this.walker.dom.outerHTML)
    this.htmlString.set(`'${convertedHTML}'`)
  }
  /**
   * Converts the raw HTML text from the DOM
   */
  buildHtmlString(rawHtml) {
    return escapeSingleQuotes(stripHtml(rawHtml))
  }
  /**
   * Sets the shieldCounts, which has to be done after parsing as nodes
   * can't know how many child nodes they will have at point of being
   * parsed.
   */
  setShieldCounts() {
    const shieldCountArgIndex = 3
    const nodePathOfEachWatchCall = this.savedWatchCallArgs.map(i => i.nodePath)
    const shieldCountForEachWatchCall = extractShieldCounts(nodePathOfEachWatchCall)
    for (const [i, argSet] of this.savedWatchCallArgs.entries()) {
      argSet.watchCallArgs[shieldCountArgIndex] = shieldCountForEachWatchCall[i]
    }
  }
  /**
   * Saves the watchCallArgs against the nodePath, which well use in watchCallArgs
   */
  saveWatchCallArgs(nodePath, watchCallArgs) {
    // The first element is undefined, which we don't need here.
    nodePath = nodePath.slice(1)
    this.savedWatchCallArgs.push({nodePath, watchCallArgs})
  }
  /**
   * Gets passed to the DomWalker, which calls this for every node.
   */
  processNode(nodeInfo) {
    const {nodePath, node, tagName} = nodeInfo
    const nodeData = extractNodeData(node, this.config, this.walker, this.processAsStub)
    if (nodeData) {
      let {afterSave, beforeSave, saveAs, props, shieldQuery, reverseShield, watches, stubName, replaceWith} = nodeData

      // If this node is a "stub", save it and because there's nothing to do stubs.
      if (stubName) {
        this.saveStub(stubName, nodePath)
        return
      }

      // Use the saveAs supplied, or get a sequential one
      saveAs = saveAs ? saveAs : this.getNextElementRef()

      // If replaceWith, then it's a nested view, which needs special treatment.
      if (replaceWith) {
        this.saveNestedView(nodePath, saveAs, nodeData, replaceWith, props, replaceWith)
      } else {
        // TODO: do we always want to save the wrapper?
        this.saveWrapper(nodePath, saveAs, nodeData)
      }


      // Ensure the shieldQuery gets added
      // This is the query to determine whether the wrappers should shield
      // nested wrappers
      shieldQuery = nodeData.expandValueSlot(shieldQuery)
      if (shieldQuery) {
        this.addWatchQueryCallback(shieldQuery)
      }
      // Use the shieldQuery supplied, 0 (must set as string here)
      shieldQuery = shieldQuery ? `'${shieldQuery}'` : '0'

      // shieldCount is the number of wrappers to shield, which will equate to the
      // number of wrappers nested underneath, which we have to calculate postParsing
      // so we just set it to 0 for now.
      const defaultShieldCount = 0


      const watchCallbacks = this.buildWatcherCallbacksObject(watches)
      const watchCallArgs = [
        `'${saveAs}'`,
        shieldQuery,
        reverseShield.toString(),
        defaultShieldCount,  // shieldCount is at position 3 - if this changes we must change setShieldCounts!
        watchCallbacks
      ]
      // We save this as we're going to need it postParsing to set the shieldCount
      // Must slice the nodePath!
      this.saveWatchCallArgs(nodePath.slice(), watchCallArgs)

      // TODO: change this, as we may call different functions to make simpler watchers
      const watchCall = new CallStatement(`${vars.prototypeVariable}.${vars.getWatch}`, watchCallArgs)
      this.watches.add(watchCall)
    }
  }
  /**
   * Builds the object with callbacks for the watcher.
   * 
   * @param {Array} watches 
   */
  buildWatcherCallbacksObject(watches) {
    const callbacksObject = new ObjectStatement()
    // TODO maybe do this before so we can alias the names ?
    const callbackLinesroupedByWatchedField = groupArray(watches, 'watch', details => details)
    for (let [watch, lines] of Object.entries(callbackLinesroupedByWatchedField)) {
      this.addWatchQueryCallback(watch)
      let callbackArgs = watch === '*' ? watchCallbackArgsAlways : watchCallbackArgs
      let callback = this.buildWatcherCallbackFunction(callbackArgs, lines)
      callbacksObject.add(watch, callback)
    }
    return callbacksObject
  }
  /**
   * 
   * @param {String} callbackArgs 
   * @param {Array} lines 
   * 
   * 
   */
  buildWatcherCallbackFunction(callbackArgs, lines) {
    // TODO: perhaps optimise to generate a function if it is simple.
    let callback = new FunctionStatement(callbackArgs)
    
    // Find lines which call methods on the wrapper so we can chain them.
    const methodLines = lines.filter(line => line.wrapperMethod)
    
    // TODO: handle lookups in here too
    if (methodLines.length > 0) {
      let chainedCalls = 'w'
      methodLines.forEach(line => {
        const firstArg = line.converter || 'n'
        let methodName = line.wrapperMethod
        let methodArgs = line.extraArg ? `${firstArg},${line.extraArg}` : firstArg
        if (methodName.startsWith('@')) {
          methodArgs = `'${methodName.substr(1)}',${methodArgs}`
          methodName = 'att'
        }
        chainedCalls += `.${methodName}(${methodArgs})`
      })
      callback.add(chainedCalls)
    }

    const nonMethodLines = lines.filter(line => !line.wrapperMethod)
    nonMethodLines.forEach(line => callback.add(line.converter))
    return callback
  } 


  /**
   * Add a saved Element.
   */
  saveWrapper(nodePath, saveAs, nodeData) {
    this.saveElement(saveAs, this.buildWrapperInitCall(nodeData, nodePath), nodeData.chainedCalls)
  }
  /**
   * Returns the call for creating a new wrapper based on nodePath.
   *
   * If customWrapperClass is provided, it is initiated with new, and the class better
   * be in scope. That is why we do it with new here rather than passing the class
   * to __gw or so.
   * Similarly, that is why we use __gw, because we know "Wrapper" will be in scope
   * there, but it isn't guaranteed to be where componentRefInBuild is defined.
   *
   */
  buildWrapperInitCall(nodeData, nodePath) {
    const path = getLookupArgs(nodePath)
    if (nodeData.wrapperOverride) {
      return nodeData.wrapperOverride
    } else if (nodeData.customWrapperClass) {
      const args = nodeData.customWrapperArgs ? ',' + nodeData.customWrapperArgs : ''
      return `new ${nodeData.customWrapperClass}(${componentRefInBuild}.__fe(${path})${args})`
    }
    return `${componentRefInBuild}.__gw(${path})`
  }
  saveNestedView(nodePath, saveAs, nodeData, tagName, props, replaceWith) {
    const nestedViewClass = replaceWith || tagName
    if (isUnd(props)) {
      props = 'c.props'
    }
    this.nestedViewProps.add(saveAs, new FunctionStatement(propsCallbackArgs, [`return ${props}`]))
    const initCall = `${componentRefInBuild}.__ni(${getLookupArgs(nodePath)}, ${nestedViewClass})`
    this.saveElement(saveAs, initCall, nodeData.chainedCalls)
  }
  saveStub(stubName, nodePath) {
    if (!re_lnu.test(stubName)) {
      this.walker.throw('Stub name may only contain letters numbers and underscores')
    }
    this.nestedViewProps.add(stubName, new FunctionStatement(propsCallbackArgs, ['return c.props']))
    const initCall = `${componentRefInBuild}.__ni(${getLookupArgs(nodePath)}, this.__stubs__${stubName})`
    this.saveElement(stubName, initCall, [])
  }
  saveElement(saveAs, initCall, chainedCalls) {
    const chainedCallStatement = chainedCalls.length ? '.' + chainedCalls.join('.') : ''
    this.savedElements.add(saveAs, `${initCall}${chainedCallStatement}`)
  }
  addWatchQueryCallback(property) {
    const callback = this.getWatchQueryCallBack(property)
    if (callback) {
      this.protoLookupCallbacks.add(property, callback)
    }
  }
  /**
   * Returns the callback for the watch query, or undefined.
   * TODO: is this necessary? Do we even call these null function?
   */
  getWatchQueryCallBack(watch) {
    if (watch !== '*') {
      /*
      TODO: fail, or warn if watch is not in scope (if not, babel does very funny stuff!)
      split string on "." and use first, but not if it is raw Js?
      Or one if it is a word followed by ".", "[" or "("

      Same will happen with callbacks?
      console.log(watch, this.babelPath.scope.hasBinding(watch))
      */

      return (watch === '' || watch === undefined) ?
        `function() {return null}` :
        `function(${lookupCallbackArgs}) {return ${watch}}`
    }
  }
  /**
   * Gets next name for saving elements.
   */
  getNextElementRef() {
    this.nextElementRefIndex ++
    return `_${this.nextElementRefIndex}`
  }
}

function generateStatements(viewData, path) {
  const builder = new CodeGenerator(viewData, path)
  return builder.buildStatements()
}

module.exports = {CodeGenerator, generateStatements}