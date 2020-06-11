import {LandingPage, SmoothieListing, SmoothieDetail, SmoothieForm} from './views'
import {smoothiesService} from './services/smoothies'

const getSmoothie = (routeData) => Promise.resolve(smoothiesService.get(routeData.args.id))


export const routerConfig = {
  routes: [
    {path: '/', cls: LandingPage},
    {path: '/smoothies', cls: SmoothieListing},
    {path: '/smoothies/new', cls: SmoothieForm},
    {path: '/smoothies/{id}', cls: SmoothieDetail, resolve: getSmoothie}
  ]
}
