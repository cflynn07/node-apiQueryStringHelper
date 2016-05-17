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
 * @param {String} fieldName
 * @param {Array<String>} requestValues
 * @param {Array<String>} validValues
 */
function validateFields (fieldName, requestValues, validValues) {
  // validate the sort fields
  const invalidList = subtract.sub(requestValues, validValues)

  if (invalidList.length) {
    let err = new Error(`invalid ${fieldName} field values: ` + invalidList.join(', '))
    err.status = 400
    throw err
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

  validateFields('sort', sortFields, allowedAttributes)

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
  if (!queryFields.every((val) => val.startsWith('-') === excludeFields)) {
    let err = new Error('cannot mix field inclusion and exclusion')
    err.status = 400
    throw err
  }

  validateFields('query', queryFields, allowedAttributes)

  // if using exclusion, remove those fields
  return excludeFields
    ? subtract.sub(allowedAttributes, queryFields)
    : queryFields
}
