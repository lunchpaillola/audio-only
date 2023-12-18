module.exports = {
 "env": {
     "browser": true,
     "es2021": true,
     node: true
 },
 "extends": [
     "eslint:recommended",
     "plugin:react/recommended"
 ],
 "overrides": [
     {
         "env": {
             "node": true
         },
         "files": [
             ".eslintrc.{js,cjs}",".webpack.config.js"
         ],
         "parserOptions": {
             "sourceType": "script"
         },
     }
 ],
 "parserOptions": {
     "ecmaVersion": "latest",
     "sourceType": "module"
 },
 "plugins": [
     "react",
     "babel"
 ],
 "rules": {
     "no-console": ["error", { "allow": ["error"] }],
 },
}
