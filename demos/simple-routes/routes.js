import {HomePage, TodoList, TodoDetail} from './views'
import {todoService} from './todoService'

export const routerConfig = {
  routes: [
    {path: '/', cls: HomePage},
    {path: '/todos', cls: TodoList},
    {path: '/todos/{id}', cls: TodoDetail, 
    	resolve: (routeData) => Promise.resolve(todoService.getTodo(routeData.args.id))
    }
  ]
}
