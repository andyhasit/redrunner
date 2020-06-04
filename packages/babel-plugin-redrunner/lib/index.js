const babel = require('@babel/core')
const {getNodeHtmlString, removeProperty} = require('./utils/babel')
const {generateStatements} = require('./redrunner/generateStatements')
const {config} = require('./redrunner/config')

let viewCount = 0

module.exports = () => {
  return {
    visitor: {
      Class(path, state) {
        if (path.type == 'ClassDeclaration') {
          let requiresGeneratedStatements = false
          let viewData = {className: path.node.id.name, config:config}

          // Iterate over class nodes to find ones we care about
          for (let node of path.node.body.body) {
            let propName = node.key.name
            if (propName == '__html__' || propName == '__clone__') {
              viewData.cloneNode = (propName == '__clone__')
              requiresGeneratedStatements = true
              viewData.html = getNodeHtmlString(node)
              removeProperty(path)
            }
          }

          if (requiresGeneratedStatements) {
            viewCount ++
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