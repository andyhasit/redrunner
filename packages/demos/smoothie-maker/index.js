import {Router} from 'redrunner-router'
import {mount} from 'redrunner'
import {routerConfig} from './routes'

mount('#main', Router, routerConfig)
window.c = console;