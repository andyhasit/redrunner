import {c, getNode} from '../../utils'
import {extractNodeData} from '../../../lib/redrunner/parse-node'
import {config} from '../../../lib/redrunner/config'

const directives = {
  ':watch': {
    params: 'property, converter, target?',
    handle: function(property, converter, target) {
      this.addWatch(property, converter, target)
    }
  }
}

test('Adding watch', () => {
  const domNode = getNode('<div :watch="name|.pretty|text"></div>')
  const nodeData = extractNodeData(domNode, {directives})
  expect(nodeData.watches[0]).toEqual({property:'name', converter: '.pretty', target: 'text'})
})
