module.exports = {
  "transform": {
    ".*": "<rootDir>/node_modules/babel-jest",
    "plugins": [
      "babel-plugin-redrunner",
      "@babel/plugin-proposal-class-properties"
    ]
  }
}