const {c, EOL} = require('../utils/constants')
const {stripHtml} = require('../utils/dom')

/**
 * Adds the global object redrunner, which provides help in the DevTools
 * console.
 */
function addDevToolsHelper() {
	const helpText = "This is the magic DevTools helper."
	const cheatSheetText = "A cheat sheet in your console?."
	const addViewFunction = `
		window.__redrunnerAdd = function(name, viewData) {
			var rand = 1;
			var views = window.redrunner.views;
			while (views.hasOwnProperty(name)) {
				name = name + '__' + rand;
				rand ++;
			}
			views[name] = viewData
		}
	`
	const lsFunction = `function() {
		for (var [key, value] of Object.entries(this.views)) {
  		console.log(key + ': ');
		}
	}`
	const styledPrint = (t,s) => `console.log("${t}", "${s}");`
	//
	noticeLines = [
		["%cRedRunner dev helper ready", "color:#a84032; font-size:25px; font-family: Impact, fantasy"],
		["%c🏃", "color:#a84032; font-size:18px"],
		["%cThis feature is only loaded in development mode.", "color:#a84032; font-size:12px"],
		["%cTry typing: redrunner.help()", "color:#a84032; font-size:12px"],
	].map(e => styledPrint(...e)).join(EOL)


	return [
		"window.redrunner = {",
		`help: "${helpText}",`,
		`cheatSheet: "${helpText}",`,
		`views: {},`,
		`ls: ${lsFunction},`,
		"};",
		addViewFunction,
		noticeLines
	].join(EOL)
}



// debug() {
//     c.log(this.__bv.toString())
//     let lines = []
//     lines.push('__wc: {')
//     for (let [name, callbacks] of Object.entries(this.__wc)) {
//       lines.push(`  "${name}": [`)
//       callbacks.forEach(e => lines.push('  ' + e.toString()))
//       lines.push('  ]')
//     }
//     lines.push('}')
//     c.log(lines.join('\n'))
//   }


function addViewInfo(viewData, filename) {
	let {className} = viewData
	let prototype = `${className}.prototype`
	return `__redrunnerAdd("${viewData.className}", {file: "${filename}", prototype: ${prototype}});`
}

module.exports = {addDevToolsHelper, addViewInfo}