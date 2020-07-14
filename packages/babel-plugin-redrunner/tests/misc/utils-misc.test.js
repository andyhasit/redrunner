import {c, getNode} from '../utils'
import {arrayStartsWith, extractShieldCounts} from '../../lib/utils/misc'



test('test arrayStartsWith', () => {
  expect(arrayStartsWith([0], [0, 1])).toBe(true)
  expect(arrayStartsWith([0], [2, 3])).toBe(false)
  expect(arrayStartsWith([2, 3], [2, 3, 0])).toBe(true)
})


test('test extractShieldCounts', () => {
  const items = [
    [0],
    [0, 4],
    [0, 4, 0],
    [0, 5],
  ]
  expect(extractShieldCounts(items)).toEqual([3, 1, 0, 0])
})
