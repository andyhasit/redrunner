import {c, getNode} from '../../utils'
import {extractNodeData} from '../../../lib/redrunner/extract_node_data'


test('Missing arg throws error', () => {
  const directives = {
    ':on': {
      params: 'foo, bar',
      handle: function(foo, bar) {
      }
    }
  }
  const domNode = getNode('<div :on="x"></div>')
  expect(() => {
    extractNodeData(domNode, {directives})
  }).toThrow(/bar/);
})
