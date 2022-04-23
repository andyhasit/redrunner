import {mount} from 'redrunner'
import {Router} from 'redrunner-router'
import {Navbar} from './navbar'
import {HomePage} from './home'
import {ClickCounter} from './click-counter'

const newCounter = () => Promise.resolve({clicks: 0})

const pages = [
  {path:
    '/',
    cls: HomePage,
    name: 'Home'
  },
  {
    path: '/clicky',
    cls: ClickCounter,
    name: 'Click',
    resolve: newCounter
  },
]

mount('navbar', Navbar, pages)
mount('router', Router, pages)
