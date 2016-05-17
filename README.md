[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![Build Status](https://travis-ci.org/bstanley0811/node-apiQueryStringHelper.svg?branch=master)](https://travis-ci.org/bstanley0811/node-apiQueryStringHelper)
[![Coverage Status](https://coveralls.io/repos/bstanley0811/node-apiQueryStringHelper/badge.svg?branch=master)](https://coveralls.io/repos/bstanley0811/node-apiQueryStringHelper/?branch=master)

# node-queryStringHelper
Middleware that inspects the request query string for a `fields` and `sort` key.  If found, the
middleware will validate them against a supplied array.  It will then append them to a
`req.apiQueryStringHelper` object as arrays.  The `fields` and `sort` keys can use inclusion and
exclusion; exclusion negated by a `-` prepending the value.

## Usage
When calling your routes, add the middleware
```js
const apiQueryStringHelper = require('apiQueryStringHelper')

const dataKeys = ['id', 'userId', 'name', 'createdAt']

// implement the middleware, passing in your valid data keys
express.get('/some/route', apiQueryStringHelper(dataKeys), require('lib/my/route/handler'))
```

Now, you can reference the `apiQueryStringHelper` object, in your route handler
```js
// example route: /some/route?fields=id,userId&sort=id,name
module.exports = (req, res, next) => {
    const fields = req.apiQueryStringHelper.fields
    // => ['id', 'userId']

    const sort = req.apiQueryStringHelper.sort
    // => ['id ASC', 'name ASC']
}
```

## Options

Using a `-` on a data field, you can get all fields except what's passed in <br />
*NOTE:* you **can not** mix inclusion and exclusion with the fields property
```js
// example route: /some/route?fields=-name
module.exports = (req, res, next) => {
    const fields = req.apiQueryStringHelper.fields
    // => ['id', 'userId', 'createdAt']

    const sort = req.apiQueryStringHelper.sort
    // => []
}
```

Using a `-` on a sort field, indicates it as `DESC` <br />
*NOTE:* feel free to mix ASC and DESC with sort
```js
// example route: /some/route?sort=-id,-name
module.exports = (req, res, next) => {
    const fields = req.apiQueryStringHelper.fields
    // => []

    const sort = req.apiQueryStringHelper.sort
    // => ['id DESC', 'name DESC']
}
```

Using neither `fields` or `sort` will result in empty arrays
```js
// example route: /some/route
module.exports = (req, res, next) => {
    const sort = req.apiQueryStringHelper.sort
    // => []

    const fields = req.apiQueryStringHelper.fields
    // => []
}
```

## Validations

If any of the below options are met, a `400` will be sent and the response will end.
- request is made with a `fields` or `sort` option that is not in the supplied validation array
- mixing of inclusion/exclustion on `fields` property
- more than 4 sort options are passed

```
// example route: /some/route?fields=invalidTestField
// => Response will end in 400 with message "invalid sort field values: invalidTestField"
```

## Tests
```sh
# Use Node v4.4.0 or higher
$ npm run test
$ npm run test-report
```
