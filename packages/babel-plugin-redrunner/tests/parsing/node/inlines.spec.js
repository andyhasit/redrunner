import {c, getNode} from '../../utils'
import {extractNodeData} from '../../../lib/redrunner/extract_node_data'
import {config} from '../../../lib/redrunner/config'

test('Simple inline', () => {
  const directives = {}
  const domNode = getNode('<div>{{name|.pretty.}}</div>')
  const nodeData = extractNodeData(domNode, {directives})
  expect(nodeData.watches[0]).toEqual({property:'name', raw: 'this.pretty', target: 'text'})
})
