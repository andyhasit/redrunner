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
                  
          const baseClass = callee.object.name
          const componentName = path.parent.id.name
          const nodeToInsertAfter = path.parentPath.parentPath
          const data = parseExArguments(path)

          if (data.html) {
            let statements = handleHtml(componentName, getNodeHtmlString(data.html), path)
            insertStatementsAfter(nodeToInsertAfter, statements)
          }

          if (data.stubs) {
            let statements = handleStubs(componentName, getNodeHtmlObjectOfStrings(data.stubs), path)
            insertStatementsAfter(nodeToInsertAfter, statements)
          }
          
          const newArgs = [t.identifier(baseClass)]
          
          // If either is supplied, we must still include both arguments to the call.
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
          if (stubs) {
            insertStatementsAfter(path, handleStubs(componentName, stubs, path))
          }
          if (html) {
            insertStatementsAfter(path, handleHtml(componentName, html, path))
          }
        }
      }
    }
  }
}


const allowedHtmlTypes = [
  'TaggedTemplateExpression',
  'TemplateLiteral',
  'StringLiteral',
]
const eitherAllowedTypes = [...allowedHtmlTypes, 'ObjectExpression']

const assertType = (path, thing, types, description) => {
  if (!types.includes(thing.type)) {
    throw path.buildCodeFrameError(`${description} must be of type ${types} but is a ${thing.type}.`)
  }
  return thing
}

const parseExArguments = (path) => {
  const args = path.node.arguments
  const data = {}

  if (args.length == 1) {
    // Must be html or an ObjectExpression - not an identifier
    const argument = assertType(path, args[0], eitherAllowedTypes, 'Argument to __ex__()')
    if (argument.type == 'ObjectExpression') {
      argument.properties.forEach(element => {
        data[element.key.name] = element.value
      })
    } else {
      data['html'] = assertType(path, args[0], allowedHtmlTypes, 'Argument to __ex__()')
    }
  } else if (args.length == 2) {
    // Must be __ex__(html, methods) where methods can be an object literal or an identifier.

    data['html'] = assertType(path, args[0], allowedHtmlTypes, 'First Argument to __ex__()')
    data['prototype'] = assertType(path, args[1], ['ObjectExpression', 'Identifier'], 'Second Argument to __ex__()')
  } else {
    throw path.buildCodeFrameError(`__ex__() takes either one or two arguments, Received ${args.length}.`)
  }
  return data
} 
