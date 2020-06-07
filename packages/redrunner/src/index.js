import {createView, h, mount, wrap} from  './utils'
import {isStr} from  './helpers'
import {View} from './view'
import {KeyedCache, SequentialCache} from './viewcache'
import {Wrapper} from './wrapper'

module.exports = {
	createView,
	h,
	mount,
	KeyedCache,
	isStr,
	SequentialCache,
	View,
	Wrapper,
	wrap
}