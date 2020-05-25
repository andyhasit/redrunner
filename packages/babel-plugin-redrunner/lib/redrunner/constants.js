/** 
 * Special attributes that can be used in the __html__ fields.
 */
const specialAttributes = {
  AS: 'as',
  CLASS: 'cls',
  NEST: 'nest',
  ON: 'on',
  PROPS: 'props',
  WATCH: 'watch'
}

/** 
 * The character on which to split attributes and inlines
 */
const splitter = '|'

/** 
 * The args string for watch callbacks.
 */
const watchArgs = '(n, o)'

module.exports = {specialAttributes, splitter, watchArgs}