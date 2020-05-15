/* Common imports */
const EOL = require('os').EOL
const htmlparse = require('node-html-parser')

/* The RedRunner attributes */
const redrunnerAtts = {
	ARGS: 'args',
	AS: 'as',
	ON: 'on',
	WATCH: 'watch'
}


const c = console

module.exports = {EOL, c, htmlparse, redrunnerAtts}