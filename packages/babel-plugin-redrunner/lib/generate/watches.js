/**
 * Builds the body for a watch callback function.
 * 
 * The function parameters will be as per watchCallbackArgs or watchCallbackArgsAlways.
 * 
 * "this.el._3.att('class', n)"
 * 
 * 
 * function(n, o, view.props, view, view.el) {
 *  //body
 * }
 * 
 */
const buildWatchCallbackBody = (nodeData, saveAs, watch) => {

  //TODO: detect inline...

  let {converter, wrapperMethod, raw, extraWrapperArgs} = watch
  let callbackBody, wrapper = `e.${saveAs}`
  let extraArg = `${extraWrapperArgs}`
  converter = converter ? nodeData.expandConverter(converter) : ''
  if (wrapperMethod) {
    // wrapperMethodString will be like "foo(" or "foo(arg1, "
    const wrapperMethodString = parseWatchTargetSlot(wrapperMethod)
    if (raw) {
      // Insert raw code from inline.
      callbackBody = `${wrapper}.${wrapperMethodString}${raw})`
    } else if (converter) {
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

const buildInlineWatch = (nodeData, wrapperMethod, inlineCallDetails) => {
  let raw
  let {property, convert, before, after} = inlineCallDetails
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


/**
 * A watch wrapperMethod must correspond to a wrapper method.
 * 
 * If the wrapperMethod starts with @, it is deemed to be att() and the remainder
 * if provided as first arg.
 * 
 * If the wrapperMethod includes ':' then it means method:firstArg
 * 
 * Note that this returns an incomplete string used in buildWatchCallbackBody.
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


module.exports = {buildWatchCallbackBody}