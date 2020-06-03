import {c, htmlparse} from '../lib/utils/constants'
import {parseNode} from '../lib/redrunner/parse-node'
import {config} from '../lib/redrunner/config'

// afterEach(() => {
//   clearCityDatabase();
// });

function getNode(html) {
 return htmlparse.parse(html).childNodes[0]
}

test('Node without relevant data returns undefined', () => {
  const domNode = getNode('<div></div>')
  const nodeData = parseNode(domNode, config)
  expect(nodeData).toBe(undefined)
})


test('Node with ":as" sets saveAs', () => {
  const domNode = getNode('<div :as="foo"></div>')
  const nodeData = parseNode(domNode, config)
  expect(nodeData.saveAs).toEqual('foo')
})


test('Node with ":on" adds chainedCalls', () => {
  const domNode = getNode('<div :on="click|.handleClick"></div>')
  const nodeData = parseNode(domNode, config)
  expect(nodeData.chainedCalls).toEqual([])
})
