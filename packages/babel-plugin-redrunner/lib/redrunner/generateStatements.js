const {ViewStatementBuilder} = require('./ViewStatementBuilder')

/**
 * Returns an array of statements to be added after the class definition.
 */
function generateStatements(viewData) {
  const builder = new ViewStatementBuilder(viewData)
  return builder.buildStatements()
}

module.exports = {generateStatements}
