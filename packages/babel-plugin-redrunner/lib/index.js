const babel = require('@babel/core')
const {getNodeHtmlString, getNodeHtmlStringDict, removeRedrunnerDefs} = require('./utils/babel')
const {generateStatements} = require('./generate/code_generator')
const {viewTemplates} = require('./parse/view_templates')
const {config} = require('./config')


module.exports = () => {
  return {
    visitor: {
      Class(path, state) {
        if (path.type === 'ClassDeclaration') {
          let foundHtmFieldInClass = false
          let className = path.node.id.name
          let viewData = {className, config}

          // Iterate over class nodes to find ones we care about
          for (let node of path.node.body.body) {
            let propName = node.key.name
            if (propName === '__html__' || propName === '__clone__') {
              viewData.clone = (propName === '__clone__')
              foundHtmFieldInClass = true
              viewData.html = getNodeHtmlString(node)
            } else if (propName === '__stubs__') {
              viewData.stubs = getNodeHtmlStringDict(node)
            }
          }
          removeRedrunnerDefs(path)

          // Check views.html for any templates.
          if (!foundHtmFieldInClass) {
            let templateFromHtmlFile = viewTemplates.getHtml(state.filename, className)
            if (templateFromHtmlFile) {
              viewData.html = templateFromHtmlFile
            }
          }

          // Process stub views
          if (viewData.stubs) {
            for (const [stubName, stubHtml] of Object.entries(viewData.stubs)) {
              let anonymousCls = path.scope.generateUidIdentifier("sv").name
              let stubViewData = {
                config: config,
                className: anonymousCls, 
                clone: viewData.clone, 
                html: stubHtml,
                asStub: true
              }
              generateStatements(stubViewData).forEach(statement =>
                path.insertAfter(babel.template.ast(statement))
              )
              path.insertAfter(babel.template.ast(`${viewData.className}.prototype.__stubs__${stubName} = ${anonymousCls};`))
              path.insertAfter(babel.template.ast(`var ${anonymousCls} = ${viewData.className}.prototype.__sv();`))
            }
          }

          if (viewData.html) {
            generateStatements(viewData).forEach(statement =>
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