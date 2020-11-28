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
 * The name of the arg representing the view in the buildView method.
 */
const viewVar = 'view'
const callableWatchArgs = `${viewVar}, props`

module.exports = {splitter, callableWatchArgs, watchArgs, EOL, redrunnerDefs, viewVar}