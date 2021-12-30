import {c, getNode} from '../../utils'
import {extractNodeData} from '../../../lib/parse/parse_node'
import {config} from '../../../lib/config/base_config'


test('Node without relevant data returns undefined', () => {
  const directives = {}
  const domNode = getNode('<div></div>')
  const nodeData = extractNodeData(domNode, {directives})
  expect(nodeData).toBe(undefined)
})


test('Setting saveAs', () => {
  const domNode = getNode('<div :as="foo"></div>')
  const nodeData = extractNodeData(domNode, {directives: config.directives})
  expect(nodeData.saveAs).toEqual('foo')
})


test('Setting props', () => {
  const domNode = getNode('<div :props=".bar"></div>')
  const nodeData = extractNodeData(domNode, {directives: config.directives})
  expect(nodeData.props).toEqual('this.bar')
})


test('Adding chainedCalls', () => {
  const directives = {
    ':on': {
      params: 'event, callbackStr',
      handle: function(event, callbackStr) {
        this.addEventListener(event, callbackStr)
      }
    }
  }
  const domNode = getNode('<div :on="click|.handleClick"></div>')
  const nodeData = extractNodeData(domNode, {directives})
  expect(nodeData.chainedCalls[0]).toMatch("on('click', function(w, e) {component.handleClick(w, e)})")
})


test('Generated directives work', () => {
  // Use somethin we know is added to config
  const domNode = getNode('<div :onClick=".handleClick"></div>')
  const nodeData = extractNodeData(domNode, config)
  expect(nodeData.chainedCalls[0]).toMatch("on('click', function(w, e) {component.handleClick(w, e)})")
})
