import {HomePage, SmoothieList, SmoothieDetail} from './views'
import {smoothiesService} from './services/smoothies'

export const routerConfig = {
  routes: [
    {path: '/', cls: HomePage},
    {path: '/smoothies', cls: SmoothieList},
    {path: '/smoothies/{id}', cls: SmoothieDetail,
    	resolve: (routeData) => Promise.resolve(smoothiesService.get(routeData.args.id))
    }
  ]
}
