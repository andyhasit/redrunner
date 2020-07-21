const babel = require('@babel/core')
const {getNodeHtmlString, getNodeObjectValue, removeProperty} = require('./utils/babel')
const {generateStatements} = require('./redrunner/generate_statements')
const {viewTemplates} = require('./redrunner/view_templates')
const {config} = require('./redrunner/config')


module.exports = () => {
  return {
    visitor: {
      Class(path, state) {
        if (path.type == 'ClassDeclaration') {
          let foundHtmFieldInClass = false
          let className = path.node.id.name
          let viewData = {className, config}

          // Iterate over class nodes to find ones we care about
          for (let node of path.node.body.body) {
            let propName = node.key.name
            if (propName == '__html__' || propName == '__clone__') {
              viewData.clone = (propName == '__clone__')
              foundHtmFieldInClass = true
              viewData.html = getNodeHtmlString(node)
              removeProperty(path)
            }
          }

          // Check views.html for any templates.
          if (!foundHtmFieldInClass) {
            let templateFromHtmlFile = viewTemplates.getHtml(state.filename, className)
            if (templateFromHtmlFile) {
              viewData.html = templateFromHtmlFile
              console.log(templateFromHtmlFile)
            }
          }

          if (viewData.html) {
            const statements = generateStatements(viewData)
            statements.forEach(statement =>
              path.insertAfter(babel.template.ast(statement))
            )
          }
        }
      }
    },
    post(state) {
      //console.log(viewCount)
    }
  }
}