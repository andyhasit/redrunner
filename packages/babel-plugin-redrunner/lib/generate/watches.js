/**
 * Builds the body for a watch callback function.
 * 
 * The function parameters will be as per watchCallbackArgs or watchCallbackArgsAlways.
 * 
 * E.g.
 * 
 *   function(n, o, p, c, e) {
 *     e._1.text(n)
 *   }
 * 
 */
const buildWatchCallbackBodyLine = (nodeData, saveAs, watch) => {
  return 'console.log("stub");'
  const func = watch.inlineRaw ? buildInlineWatchCallback : buildManualWatchCallback
  return func(nodeData, saveAs, watch)
}

const buildManualWatchCallback = (nodeData, saveAs, watch) => {
  let {converter, wrapperMethod, extraWrapperArgs} = watch
  let callbackBody, wrapper = `e.${saveAs}`
  let extraArg = `${extraWrapperArgs}`
  converter = converter ? nodeData.expandConverter(converter) : ''
  if (wrapperMethod) {
    // wrapperMethodString will be like "foo(" or "foo(arg1, "
    const wrapperMethodString = parseWatchTargetSlot(wrapperMethod)
    if (converter) {
      callbackBody = `${wrapper}.${wrapperMethodString}${converter}, ${extraArg})`
    } else {
      callbackBody = `${wrapper}.${wrapperMethodString}n, ${extraArg})`
    }
  } else {
    // No watch wrapperMethod, meaning we are operating on the wrapper directly.
    console.log(converter)
    callbackBody = `${converter}(n, o, ${wrapper}, p, c)`
  }
  return callbackBody
}


/**
 * A watch wrapperMethod must correspond to a wrapper method.
 * 
 * If the wrapperMethod starts with @, it is deemed to be att() and the remainder
 * if provided as first arg.
 * 
 * If the wrapperMethod includes ':' then it means method:firstArg
 * 
 * Note that this returns an incomplete string used in buildWatchCallbackBodyLine.
 * 
 * @param {string} wrapperMethod -- the wrapperMethod slot
 */
const parseWatchTargetSlot = (wrapperMethod) => {
  if (wrapperMethod.startsWith('@')) {
    wrapperMethod = 'att:' + wrapperMethod.substr(1)
  }
  const [method, arg] = wrapperMethod.split(':')
  if (arg) {
    return `${method}('${arg}', `
  }
  return wrapperMethod + '('
}





/**
 * Builds the watch object as:
 * 
 * {
 *    property,  // the watched property
 *    wrapperMethod  ,  // the wrapper method
 * }
 */
const buildInlineWatch = (nodeData, wrapperMethod, inlineCalls) => {
  let raw
  let {property, convert, before, after} = inlineCalls
  /*
  before and after is any text found before or after the brackets.
  raw is the raw javascript code that will be generated.
  */
  convert = convert ? nodeData.expandConverter(convert) : 'n'
  if (before && after) {
    raw = `"${before}" + ${convert} + "${after}"`
  } else if (before && !after) {
    raw = `"${before}" + ${convert}`
  } else if (!before && after) {
    raw = `${convert} + "${after}"`
  } else {
    raw = convert
  }
  return {property, raw, wrapperMethod}
}






module.exports = {buildWatchCallbackBodyLine}