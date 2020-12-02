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

/**
 * The name of the arg representing the view in the buildView method.
 */
const viewVar = 'view'
const callableWatchArgs = `${viewVar}, props`

module.exports = {
  EOL,
  callableWatchArgs,
  redrunnerDefs, 
  splitter,
  viewVar,
  watchArgs,
  watchCallbackArgs,
  watchCallbackArgsAlways
}