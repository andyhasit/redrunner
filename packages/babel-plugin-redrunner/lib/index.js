const babel = require('@babel/core')
const {getNodeHtmlString, getNodeHtmlStringDict, removeRedrunnerDefs} = require('./utils/babel')
const {generateStatements} = require('./redrunner/view_statement_builder')
const {viewTemplates} = require('./redrunner/view_templates')
const {config} = require('./redrunner/config')
const { c } = require('./utils/constants')


module.exports = function({ types: t}) {
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
            } else if (propName == '__stubs__') {
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
      },
      Expression(path) {
        /*
        Creates leaf views (i.e. no class definition) from statments like:
        
            const MyView = View.leaf({__html__: `<br/>})

        These are fully functional, but can't inherit from or be inherited from with class syntax.
        Just saves on space.
        */
        const node = path.node
        if (
          node.type === 'CallExpression' && 
          node.callee.type === 'MemberExpression' &&
          node.callee.object.name === 'View'
          ) {
          const viewMethod = node.callee.property.name;
          if (viewMethod !== 'leaf') {
            return
          }
          if (node.arguments.length === 1 &&  node.arguments[0].type === 'ObjectExpression') {
            const objectArg = node.arguments[0]
            let html = null
            objectArg.properties.forEach(element => {
              if (element.key.name == '__html__') {
                html = getNodeHtmlString(element)
              }
              //htmlStrings[element.key.name] = getNodeHtmlString(element)
            })
            node.callee = t.MemberExpression(
              t.MemberExpression(
                t.identifier('View'),
                t.identifier('prototype')
              ),
              t.identifier('__sv')
            )
            node.arguments.length = 0;
            viewData = {
              className: 'MyView', 
              config: config,
              html: html,
              asStub: false
            }
            generateStatements(viewData).forEach(statement =>
              path.parentPath.parentPath.insertAfter(babel.template.ast(statement))
            )
          } else {
            throw `Call on View.${viewMethod} must contain 1 argument only which must be ano object.`
          }
        }
      }
    },
    post(state) {
      //console.log(viewCount)
    }
  }
}