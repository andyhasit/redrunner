import {Router} from '../../src/router'
import {mount} from '../../src/utils'
import {routerConfig} from './routes'

mount('#main', Router, routerConfig)
window.c = console;