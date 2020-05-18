/** 
 * Special attributes that can be used in the __html__ fields.
 */
const specialAttributes = {
  ARGS: 'args',
  AS: 'as',
  ON: 'on',
  WATCH: 'watch'
}

/** 
 * The character on which to split attributes and inlines
 */
const splitter = '|'

module.exports = {specialAttributes, splitter}