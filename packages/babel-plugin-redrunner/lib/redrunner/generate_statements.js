const {ViewStatementBuilder} = require('./view_statement_builder')

/**
 * Returns an array of statements to be added after the class definition.
 */
function generateStatements(viewData) {
  const builder = new ViewStatementBuilder(viewData)
  return builder.buildStatements()
}

module.exports = {generateStatements}
