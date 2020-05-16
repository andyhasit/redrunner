/* Common imports */
const EOL = require('os').EOL
const htmlparse = require('node-html-parser')

/* This helps */
const c = console

/* The RedRunner attributes */
const redrunnerAtts = {
	ARGS: 'args',
	AS: 'as',
	ON: 'on',
	WATCH: 'watch'
}

module.exports = {EOL, c, htmlparse, redrunnerAtts}