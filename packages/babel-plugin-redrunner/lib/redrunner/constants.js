/** 
 * Special attributes that can be used in the __html__ fields.
 */
const specialAttributes = {
  PROPS: 'props',
  AS: 'as',
  ON: 'on',
  NEST: 'nest',
  WATCH: 'watch'
}

/** 
 * The character on which to split attributes and inlines
 */
const splitter = '|'

module.exports = {specialAttributes, splitter}