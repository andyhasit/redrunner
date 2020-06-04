

/**
 * Returns a statment adding an array to a prototype.
 */
function addPrototypeArray(className, name, body) {
  return [`${className}.prototype.${name} = [`, body, '];'].join(EOL)
}

/**
 * Returns a statment adding a field to a prototype.
 */
function addPrototypeField(className, name, statment) {
  return [`${className}.prototype.${name} = `, statment, ';'].join(EOL)
}

/**
 * Returns a statment adding a function to a prototype.
 */
function addPrototypeFunction(className, name, signature, body) {
  return [`${className}.prototype.${name} = function(${signature}){`, body, '};'].join(EOL)
}

/**
 * Returns a statment adding an object to a prototype.
 */
function addPrototypeObject(className, name, body) {
  return [`${className}.prototype.${name} = {`, body, '};'].join(EOL)
}



/**
 * Generates the statements.
 */
class StatementBuilder {
  constructor(viewData, parsedData) {
    this.cloneNode = viewData.cloneNode
    this.className = viewData.className
    this.parsedData = parsedData
  }
  generateStatements() {
    // Return only statements which contain something...
    return [
      this.build__bv(),
      this.build__cn(),
      this.build__ht(),
      this.build__wc(),
      this.build__wq()
    ].filter(s => s)
  }
  build__bv() {
    const lines = []
    lines.push(`view.__bd(prototype, ${this.cloneNode});`)

    // Add remaining lines (must come before dom!)
    this.parsedData.buildMethodLines.forEach(n => lines.push(n))

    // Add this.dom definition
    if (this.parsedData.domObjectLines.length > 0) {
      lines.push('view.dom = {')
      this.parsedData.domObjectLines.forEach(n => lines.push(n))
      lines.push('};')
    } else {
      lines.push('view.dom = {};')
    }
    const body = lines.join(EOL)
    return addPrototypeFunction(this.className, '__bv', 'view, prototype', body)
  }
  build__cn() {
    if (this.cloneNode) {
      return addPrototypeField(this.className, '__cn', 'undefined')
    }
  }
  build__ht() {
    return addPrototypeField(this.className, '__ht', `'${this.parsedData.cleanHTML}'`)
  }
  build__wc() {
    const lines = []
    this.parsedData.watchCallbackItems.forEach(entry => {
      let {wrapper, shield, callbacks} = entry
      let callbackLines = ['{']
      for (let [key, value] of Object.entries(callbacks)) {
        callbackLines.push(`'${key}': ${value}`)
      }
      callbackLines.push(`}`)
      lines.push(`{wrapper: '${wrapper}', shield: ${shield}, callbacks: ${callbackLines.join(EOL)}},`)
    })
    const body = lines.join(EOL)
    return addPrototypeArray(this.className, '__wc', body)
  }
  build__wq() {
    const lines = []
    for (let [key, callback] of Object.entries(this.parsedData.watchQueryItems)) {
      lines.push(`'${key}': ${callback},`)
    }
    if (lines.length) {
      const body = lines.join(EOL)
      return addPrototypeObject(this.className, '__wq', body)
    }
  }
}



   /*

      saveWatch(saveAs, name, property, callbackBody) {
    const callbackStatement = ['function(n, o) {', callbackBody, '},'].join(EOL)
    //this.getWatchCallbackItems(name).push(callbackStatement)
    // TODO: Only saves one callback. Just try for testing.
    const callbacks = {}
    callbacks[name] = callbackStatement
    this.watchCallbackItems.push({
      wrapper:saveAs, shield: 0, callbacks: callbacks
    })
    */

  processNormalNodeOld(nodePath, node, tagName) {
    let {nest, on, saveAs, watch, wrapperClass} = findRedRunnerAtts(node)
    let wrapperCall, chainedCalls = ''

    /* Generates a unique variable name if saveAs has not been defined */
    const implicitSave = _ => saveAs = saveAs ?  saveAs : this.getUniqueVarName()

    const inlineCallsWatches = extractInlineCallWatches(node)

    if (inlineCallsWatches.length > 0) {
      implicitSave()
      inlineCallsWatches.forEach(w => this.addNodeWatch(w, saveAs))
    }
    if (watch) {
      implicitSave()
      this.addNodeWatch(watch, saveAs)
    }
    if (nest) {
      implicitSave()
      this.addNestWatch(nest, saveAs)
      wrapperCall = this.getCachedWrapperCall(nest, nodePath, wrapperClass)
    }
    if (on) {
      implicitSave()
      // We can use a chained call on the wrapper because it returns "this"
      chainedCalls = `.on('${on.event}', ${on.callback})`
    }
    if (saveAs) {
      wrapperCall = wrapperCall || this.getRegularWrapperCall(nodePath, wrapperClass)
      this.domObjectLines.push(`${saveAs}: ${wrapperCall}${chainedCalls},`)
    }
  }


  getCachedWrapperCall(nest, nodePath, wrapperClass) {
    const path = lookupArgs(nodePath)
    const config = nest.config? expandShorthand(nest.config) : '{}'
    let cache

    const getCacheKeyFunction = key => {
      if (key.endsWith('?')) {
        return expandShorthand(key.slice(0, -1))
      }
      return `function(props) {return props.${key}}`
    }
    // Build cache call
    if (nest.cache.startsWith('@')) {
      cache = expandShorthand(nest.cache.substr(1))
    } else {
      const [viewCacheClass, viewCacheKey] = nest.cache.split(':')
      if (viewCacheKey) {
        const keyFn = getCacheKeyFunction(viewCacheKey)
        cache = `view.__kc(${viewCacheClass}, ${keyFn})`
      } else {
        cache = `view.__sc(${viewCacheClass})`
      }
    }

    if (wrapperClass) {
      return `new ${wrapperClass}(view.__lu(${path}), ${cache}, ${config})`
    }
    return `view.__cw(${path}, ${cache}, ${config})`
  }
  /**
   * Adds a watch for the nest attribute.
   */
  addNestWatch(nest, saveAs) {
    const wrapper = `this.dom.${saveAs}`
    const callbackBody = `${wrapper}.items(${nest.convert})`
    this.saveWatch(saveAs, nest.name, nest.property, callbackBody)
  }
