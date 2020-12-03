const babel = require('@babel/core')


const {template} = require('@babel/template')
const {generate} = require('@babel/generator')
const t = require('@babel/types')


const {getNodeHtmlString, getNodeHtmlObjectOfStrings, removeRedrunnerDefs} = require('./utils/babel')
const {generateStatements} = require('./generate/code_generator')


const processStubs = (componentName, stubs, path) => {
  const statements = []
  for (const [stubName, stubHtml] of Object.entries(stubs)) {
    let anonymousCls = path.scope.generateUidIdentifier("sv").name
    generateStatements(anonymousCls, stubHtml, true, path).forEach(statement => {
      statements.push(statement)
    })
    statements.push(`${componentName}.prototype.__stubs__${stubName} = ${anonymousCls};`)
    statements.push(`var ${anonymousCls} = ${componentName}.prototype.__sv();`)
  }
  return statements
}


const processHtmlString = (componentName, html, path) => {
  return generateStatements(componentName, html, false, path)
}

const insertStatementsAfter = (path, statements) => {
  statements.forEach(statement =>
    path.insertAfter(babel.template.ast(statement))
  )
}

module.exports = () => {
  return {
    visitor: {
      MemberExpression(path) {
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
            let statements = processHtmlString(componentName, getNodeHtmlString(data.html), path)
            insertStatementsAfter(nodeToInsertAfter, statements)
          }

          if (data.stubs) {
            let statements = processStubs(componentName, getNodeHtmlObjectOfStrings(data.stubs), path)
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
            insertStatementsAfter(path, processHtmlString(componentName, html, path))
          }

          if (stubs) {
            insertStatementsAfter(path, processStubs(componentName, stubs, path))
          }

        }
      }
    }
  }
}