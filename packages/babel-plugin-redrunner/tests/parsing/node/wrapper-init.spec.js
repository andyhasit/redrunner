import {c, getNode} from '../../utils'
import {extractNodeData} from '../../../lib/redrunner/extract_node_data'
import {config} from '../../../lib/redrunner/config'

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
