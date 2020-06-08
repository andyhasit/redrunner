import {mount} from 'redrunner'
import {Router} from 'redrunner-router'
import {routerConfig} from './routes'

mount('#main', Router, routerConfig)
window.c = console;