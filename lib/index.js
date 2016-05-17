'use strict'

const Subtract = require('array-subtract')
const subtract = new Subtract((a, b) => { return a === b })

function getSortOrder (queryString, allowedAttributes) {
  const sortFields = queryString.sort ? queryString.sort.split(',') : []

  if (!sortFields.length) {
    return []
  }

  // prevent too many sort options
  if (sortFields.length > 4) {
    let err = new Error('too many sort options requested')
    err.status = 400
    throw err
  }

  // validate sort fields being requested
  // to validate, we need to remove any '-' from the fields
  const vSortFields = sortFields.map((sortItem) => {
    if (sortItem.startsWith('-')) {
      return sortItem.substring(1)
    }
    return sortItem
  })

  // validate the sort fields
  const invalidSortFields = subtract.sub(vSortFields, allowedAttributes)

  if (invalidSortFields.length) {
    let err = new Error('invalid sort field values: ' + invalidSortFields.join(', '))
    err.status = 400
    throw err
  }

  // set the query sort
  return sortFields.map((field) => field.startsWith('-') ? field.substring(1) + ' DESC' : field + ' ASC')
}

function getQueryFields (queryString, allowedAttributes) {
  const queryFields = queryString.fields ? queryString.fields.split(',') : []

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

    // if using field exclusion, remove the '-' from the property
    if (excludeFields) {
      arr[index] = field.substring(1)
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

module.exports = {
  init: function (allowedAttributes) {
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
}