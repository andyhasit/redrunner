/*

Run the Demo with `npm run start`

By commenting out sections below you can toggle between running the Smoothies
demo app, and a simple view for quick experiments.

*/

import {mount, View} from 'redrunner'    // Imports for both sections
window.c = console;                      // Just helps debugging :-)


/*
-------------------------------------------------------------------------------
This section provides a simple view for quick experiments.
Comment out the other section before uncommenting this one.
-------------------------------------------------------------------------------
*/
// const props = {name: 'RedRunner'}
// class TestView extends View {
//   __html__ = `
//     <div>
//       <h1>Hello {name}</h1>
//     </div>
//   `
// }
// mount('#main', TestView, props)


/*
-------------------------------------------------------------------------------
This section runs the Smoothies demo app.
Comment out the other section before uncommenting this one.
-------------------------------------------------------------------------------
*/
import {Router} from 'redrunner-router'
import {routerConfig} from './routes'
mount('#main', Router, routerConfig)
