const t = require('@babel/types')
const {handleHtml, handleStubs} = require('./handlers')
const {
  getNodeHtmlString, 
  getNodeHtmlObjectOfStrings, 
  insertStatementsAfter, 
  removeRedrunnerDefs
} = require('./utils/babel')


module.exports = () => {
  return {
    visitor: {
      MemberExpression(path) {
        // TODO, maybe move this into the CallExpression or at least do the same checks.
        if (path.node.property.name === '__ex__') {
          const baseClass = path.node.object.name
          path.replaceWithSourceString(`${baseClass}.prototype.__ex`)
        }
      },
      CallExpression(path) {
        const callee = path.node.callee
        if (
          callee &&
          callee.type === 'MemberExpression' && 
          callee.property.name === '__ex__' &&
          path.parent &&
          path.parent.type === 'VariableDeclarator'
          ) {
 
          if (path.node.arguments.length !== 1) {
            throw new Error('__ex__() takes only one argument: a string or an object')
          }
          
          const data = {}
          const argument = path.node.arguments[0]
          const baseClass = callee.object.name
          const componentName = path.parent.id.name
          const nodeToInsertAfter = path.parentPath.parentPath
          
          if (argument.type == 'ObjectExpression') {
            argument.properties.forEach(element => {
              data[element.key.name] = element.value
            })
          } else {
            data['html'] = argument
          }

          if (data.html) {
            let statements = handleHtml(componentName, getNodeHtmlString(data.html), path)
            insertStatementsAfter(nodeToInsertAfter, statements)
          }

          if (data.stubs) {
            let statements = handleStubs(componentName, getNodeHtmlObjectOfStrings(data.stubs), path)
            insertStatementsAfter(nodeToInsertAfter, statements)
          }
          
          const newArgs = [t.identifier(baseClass)]
          
          // If either is supplied, we include both, because of order
          let protoArg, constructorArg
          if (data.hasOwnProperty('prototype')) {
            protoArg = data.prototype
          }
          if (data.hasOwnProperty('constructor')) {
            constructorArg = data.constructor
          }
          if (protoArg || constructorArg) {
            newArgs.push(protoArg || t.identifier('undefined'))
            newArgs.push(constructorArg)
          }
          path.node.arguments = newArgs

        }
      },
      Class(path, state) {
        if (path.type === 'ClassDeclaration') {

          // TODO: tidy up how args are passed, and whether we bother with viewData...
          let html, stubs, componentName = path.node.id.name

          // Iterate over class nodes to find ones we care about
          for (let node of path.node.body.body) {
            let propName = node.key.name
            if (propName === '__html__' || propName === '__clone__') {
              html = getNodeHtmlString(node.value)
            } else if (propName === '__stubs__') {
              stubs = getNodeHtmlObjectOfStrings(node.value)
            }
          }
          removeRedrunnerDefs(path)

          // Check views.html for any templates.
          // Disabled, may remove feature...
          // if (!foundHtmFieldInClass) {
          //   let templateFromHtmlFile = viewTemplates.getHtml(state.filename, componentName)
          //   if (templateFromHtmlFile) {
          //     viewData.html = templateFromHtmlFile
          //   }
          // }

          if (html) {
            insertStatementsAfter(path, handleHtml(componentName, html, path))
          }

          if (stubs) {
            insertStatementsAfter(path, handleStubs(componentName, stubs, path))
          }

        }
      }
    }
  }
}