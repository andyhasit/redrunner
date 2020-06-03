



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
  /**
   * Returns the call for creating a new wrapper based on nodePath.
   *
   * If wrapperClass is provided, it is initiated with new, and the class better
   * be in scope. That is why we do it with new here rather than passing the class
   * to __gw or so.
   * Similarly, that is why we use __gw, because we know "Wrapper" will be in scope
   * there, but it isn't guaranteed to be where the view is defined.
   *
   * I'm a bit uneasy having 'view' - should probably be a constant.
   */
  getRegularWrapperCall(nodePath, wrapperClass) {
    const path = lookupArgs(nodePath)
    return wrapperClass ? `new ${wrapperClass}(view.__lu(${path}))` : `view.__gw(${path})`
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
  /**
   * Adds a watch, creating both the callback and the query functions.
   *
   * @param {object} watch An object of shape {name, convert, target}
   * @param {string} saveAs The name to which the wrapper is to be saved.
   *
   */
  addNodeWatch(watch, saveAs) {
    let callbackBody, wrapper = `this.dom.${saveAs}`
    if (watch.target) {
      const targetString = parseTarget(watch.target)
      if (watch.raw) {
        callbackBody = `${wrapper}.${targetString}${watch.raw})`
      } else if (watch.convert) {
        callbackBody = `${wrapper}.${targetString}${watch.convert})`
      } else {
        callbackBody = `${wrapper}.${targetString}n)`
      }
    } else {
      // No watch target. Assume convert is provided.
      // But it needs messy adjusting...
      if (watch.convert.endsWith(watchArgs)) {
        callbackBody = `${watch.convert.slice(0, -1)}, ${wrapper})`
      } else if (watch.convert.endsWith(')')) {
        callbackBody = `${watch.convert}`
      } else {
        callbackBody = `${watch.convert}${watchArgs.slice(0, -1)}, ${wrapper})`
      }
    }
    this.saveWatch(saveAs, watch.name, watch.property, callbackBody)
  }
  saveWatch(saveAs, name, property, callbackBody) {
    const callbackStatement = ['function(n, o) {', callbackBody, '},'].join(EOL)
    //this.getWatchCallbackItems(name).push(callbackStatement)
    // TODO: Only saves one callback. Just try for testing.
    const callbacks = {}
    callbacks[name] = callbackStatement
    this.watchCallbackItems.push({
      wrapper:saveAs, shield: 0, callbacks: callbacks
    })
    if (property !== '*') {
      if (property === '' || property === undefined) {
        this.watchQueryItems[name] = `function() {return null}`
      } else {
        this.watchQueryItems[name] = `function() {return ${property}}`
      }
    }
  }