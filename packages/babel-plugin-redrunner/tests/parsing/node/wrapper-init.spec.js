import {c, getNode} from '../../utils'
import {extractNodeData} from '../../../lib/parse/parse_node'

const directives = {
  ':wrapper': {
    params: 'cls, argStr?',
    handle: function(cls, argStr) {
      this.wrapperClass = cls
    }
  }
}

// TODO decide on argStr format.


test('Setting wrapper', () => {
  const domNode = getNode('<div :wrapper="MySpecialWrapper"></div>')
  const nodeData = extractNodeData(domNode, {directives})
  expect(nodeData.wrapperClass  ).toMatch("MySpecialWrapper")
})
