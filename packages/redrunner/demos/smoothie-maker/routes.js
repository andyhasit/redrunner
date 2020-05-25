import {HomePage, SmoothieList, SmoothieDetail} from './views'
import {smoothies} from './smoothies'

export const routerConfig = {
  routes: [
    {path: '/', cls: HomePage},
    {path: '/smoothies', cls: SmoothieList},
    {path: '/smoothies/{id}', cls: SmoothieDetail, 
    	resolve: (routeData) => Promise.resolve(smoothies.get(routeData.args.id))
    }
  ]
}
