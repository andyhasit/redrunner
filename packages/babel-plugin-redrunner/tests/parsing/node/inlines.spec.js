import {c, getNode} from '../../utils'
import {extractNodeData} from '../../../lib/parse/parse_node'

test('Simple inline', () => {
  const directives = {}
  const domNode = getNode('<div>{{name|.pretty.}}</div>')
  const nodeData = extractNodeData(domNode, {directives})
  expect(nodeData.watches[0]).toEqual({property:'name', raw: 'this.pretty', target: 'text'})
})
