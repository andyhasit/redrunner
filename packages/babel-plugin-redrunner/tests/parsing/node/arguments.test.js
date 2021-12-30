import {c, getNode} from '../../utils'
import {extractNodeData} from '../../../lib/parse/parse_node'


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
