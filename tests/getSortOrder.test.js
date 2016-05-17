'use strict'
const request = require('supertest')
const express = require('express')
const apiQueryStringHelper = require('../lib/index.js')
const expect = require('chai').expect

const app = express()
const validFields = ['id', 'userId', 'name', 'createdAt']

app.get('/user', apiQueryStringHelper(validFields), function (req, res) {
  res.status(200).json({ middleWareData: req.apiQueryStringHelper })
})

describe('getSortOrder', () => {
  describe('Errors', () => {
    it('should respond with 400 when too many sort options are provided ', (done) => {
      request(app)
        .get('/user?sort=id,id,id,id,id')
        .expect(400)
        .end((err, res) => {
          if (err) { throw err }
          expect(res.body).to.have.all.keys(['message'])
          expect(res.body.message).to.equal('too many sort options requested')
          done()
        })
    })

    it('should respond with 400 when an invalid ascending sort field is supplied', (done) => {
      request(app)
        .get('/user?sort=invalidField')
        .expect(400)
        .end((err, res) => {
          if (err) { throw err }
          expect(res.body).to.have.all.keys(['message'])
          expect(res.body.message).to.equal('invalid sort field values: invalidField')
          done()
        })
    })

    it('should respond with 400 when an invalid descending sort field is supplied', (done) => {
      request(app)
        .get('/user?sort=-invalidField')
        .expect(400)
        .end((err, res) => {
          if (err) { throw err }
          expect(res.body).to.have.all.keys(['message'])
          expect(res.body.message).to.equal('invalid sort field values: -invalidField')
          done()
        })
    })

    it('should respond with 400 when a mixture of valid and invalid sort fields are supplied', (done) => {
      request(app)
        .get('/user?sort=id,-invalidField')
        .expect(400)
        .end((err, res) => {
          if (err) { throw err }
          expect(res.body).to.have.all.keys(['message'])
          expect(res.body.message).to.equal('invalid sort field values: -invalidField')
          done()
        })
    })
  })

  describe('Successes', () => {
    it('should return an empty array when no sort parameter is declared', (done) => {
      request(app)
        .get('/user')
        .expect(200)
        .end((err, res) => {
          if (err) { throw err }
          expect(res.body.middleWareData.sort).to.eql([])
          done()
        })
    })
    it('should return a valid array when single ascending sort value is given', (done) => {
      request(app)
        .get('/user?sort=id')
        .expect(200)
        .end((err, res) => {
          if (err) { throw err }
          expect(res.body.middleWareData.sort).to.eql(['id ASC'])
          done()
        })
    })
    it('should return a valid array when single descending sort value is given', (done) => {
      request(app)
        .get('/user?sort=-id')
        .expect(200)
        .end((err, res) => {
          if (err) { throw err }
          expect(res.body.middleWareData.sort).to.eql(['id DESC'])
          done()
        })
    })
    it('should return a valid array when mixed ascending and descending sort values are given', (done) => {
      request(app)
        .get('/user?sort=-id,name')
        .expect(200)
        .end((err, res) => {
          if (err) { throw err }
          expect(res.body.middleWareData.sort).to.eql(['id DESC', 'name ASC'])
          done()
        })
    })
  })
})
