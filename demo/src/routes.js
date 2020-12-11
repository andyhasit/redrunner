import {WelcomePage} from './examples/landing'

const getSmoothie = (routeData) => Promise.resolve(routeData)

export const routerConfig = {
  routes: [
    {path: '/', cls: LandingPage},
    // {path: '/routes', cls: },
    // {path: '/smoothies/new', cls: SmoothieForm},
    // {path: '/smoothies/{id}', cls: SmoothieDetail, resolve: getSmoothie}
  ]
}
