'use strict'

const Subtract = require('array-subtract')
const subtract = new Subtract((a, b) => { return a.replace(/^-/, '') === b.replace(/^-/, '') })

module.exports = function (allowedAttributes) {
  return function (req, res, next) {
    try {
      req.apiQueryStringHelper = {
        sort: getSortOrder(req.query, allowedAttributes),
        fields: getQueryFields(req.query, allowedAttributes)
      }
      next()
    } catch (err) {
      res.status(err.status).send({message: err.message}).end()
    }
  }
}

/**
 * @param {Object} reqQueryObject
 * @param {Array} allowedAttributes
 */
function getSortOrder (reqQueryObject, allowedAttributes) {
  const sortFields = reqQueryObject.sort ? reqQueryObject.sort.split(',') : []

  if (!sortFields.length) {
    return []
  }

  // prevent too many sort options
  if (sortFields.length > 4) {
    let err = new Error('too many sort options requested')
    err.status = 400
    throw err
  }

  // validate the sort fields
  const invalidSortFields = subtract.sub(sortFields, allowedAttributes)

  if (invalidSortFields.length) {
    let err = new Error('invalid sort field values: ' + invalidSortFields.join(', '))
    err.status = 400
    throw err
  }

  // set the query sort
  return sortFields.map((field) => field.startsWith('-')
    ? field.substring(1) + ' DESC'
    : field + ' ASC'
  )
}

/**
 * @param {Object} reqQueryObject
 * @param {Array} allowedAttributes
 */
function getQueryFields (reqQueryObject, allowedAttributes) {
  const queryFields = reqQueryObject.fields ? reqQueryObject.fields.split(',') : []

  if (!queryFields.length) {
    return []
  }

  const excludeFields = queryFields[0].startsWith('-')

  // validate query fields don't contain positive and negative values
  queryFields.forEach((field, index, arr) => {
    if (field.startsWith('-') !== excludeFields) {
      let err = new Error('cannot mix field inclusion and exclusion')
      err.status = 400
      throw err
    }
  })

  // validate the query fields being requested
  const invalidFields = subtract.sub(queryFields, allowedAttributes)
  if (invalidFields.length) {
    let err = new Error('invalid query fields values: ' + invalidFields.join(', '))
    err.status = 400
    throw err
  }

  // if using exclusion, remove those fields
  if (excludeFields) {
    return subtract.sub(allowedAttributes, queryFields)
  } else {
    return queryFields
  }
}
