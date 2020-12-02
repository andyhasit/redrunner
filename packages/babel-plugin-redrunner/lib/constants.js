const EOL = require('os').EOL
const redrunnerDefs = ['__html__', '__clone__', '__stubs__']

/**
 * The character on which to split attributes and inlines
 */
const splitter = '|'

/**
 * The args string for watch callbacks.
 */
const watchArgs = '(n, o)'

/**
 * The parameters for watch callback functions.
 * The letters mean:
 * 
 *  newValue
 *  oldValue
 *  wrapper
 *  props
 *  component
 */
const watchCallbackArgs = 'n, o, w, p, c'

/**
 * The parameters for an "always" watch callback function ('*')
 * See watchCallbackArgs for letter meaning.
 */
const watchCallbackArgsAlways = 'w, p, c'
const lookupCallbackArgs = 'c, p'
const propsCallbackArgs = 'c, p'
const eventCallbackArgs = 'w, e'

/**
 * The name of the arg representing the view in the buildView method.
 */
const componentRefInBuild = 'view'
const callableWatchArgs = `${componentRefInBuild}, props`

module.exports = {
  EOL,
  callableWatchArgs,
  eventCallbackArgs,
  redrunnerDefs, 
  splitter,
  componentRefInBuild,
  lookupCallbackArgs,
  propsCallbackArgs,
  watchArgs,
  watchCallbackArgs,
  watchCallbackArgsAlways
}