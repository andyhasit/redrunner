import {c, getNode} from '../utils'
import {extractNodeData} from '../../lib/redrunner/parse-node'
import {config} from '../../lib/redrunner/config'


test('Node without relevant data returns undefined', () => {
  const directives = {}
  const domNode = getNode('<div></div>')
  const nodeData = extractNodeData(domNode, {directives})
  expect(nodeData).toBe(undefined)
})


test('Setting saveAs', () => {
  const directives = {
    ':as': {
      handle: function(arg) {
        this.saveAs = arg
      }
    }
  }
  const domNode = getNode('<div :as="foo"></div>')
  const nodeData = extractNodeData(domNode, {directives})
  expect(nodeData.saveAs).toEqual('foo')
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
  expect(nodeData.chainedCalls[0]).toMatch("on('click', function(e, w) {view.handleClick(e, w)})")
})


test('Generated directives work', () => {
  // Use somethin we know is added to config
  const domNode = getNode('<div :onClick=".handleClick"></div>')
  const nodeData = extractNodeData(domNode, config)
  expect(nodeData.chainedCalls[0]).toMatch("on('click', function(e, w) {view.handleClick(e, w)})")
})
