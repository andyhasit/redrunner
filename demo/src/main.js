import {mount} from 'redrunner'
import {Router} from 'redrunner-router'

// Import all the examples and give them a route.
import {WelcomePage} from './welcome'
import {Navbar} from './navbar'
import {TodoList} from './examples/todo-list'

/**
 * These containg data for the router and the menu.
 */
const pages = [
  {path: '/', cls: WelcomePage, name: 'Home'},
  {path: '/todos', cls: TodoList, name: 'Todos'},
]

// {path: '/smoothies/{id}', cls: SmoothieDetail, resolve: getSmoothie}
// const getSmoothie = (routeData) => Promise.resolve(routeData)

mount('navbar', Navbar, pages)
mount('router', Router, pages)
