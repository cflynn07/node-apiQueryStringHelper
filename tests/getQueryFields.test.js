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

describe('getQueryFields', () => {
  describe('Errors', () => {
    it('should respond with 400 when mixing inclusions and exclusions', (done) => {
      request(app)
        .get('/user?fields=id,-name')
        .expect(400)
        .end((err, res) => {
          if (err) { throw err }
          expect(res.body).to.have.all.keys(['message'])
          expect(res.body.message).to.equal('cannot mix field inclusion and exclusion')
          done()
        })
    })

    it('should respond with 400 when a single invalid field is requested', (done) => {
      request(app)
        .get('/user?fields=invalidField')
        .expect(400)
        .end((err, res) => {
          if (err) { throw err }
          expect(res.body).to.have.all.keys(['message'])
          expect(res.body.message).to.equal('invalid query field values: invalidField')
          done()
        })
    })

    it('should respond with 400 when multiple invalid fields are requested', (done) => {
      request(app)
        .get('/user?fields=invalidField1,invalidField2')
        .expect(400)
        .end((err, res) => {
          if (err) { throw err }
          expect(res.body).to.have.all.keys(['message'])
          expect(res.body.message).to.equal('invalid query field values: invalidField1, invalidField2')
          done()
        })
    })
  })

  describe('Successes', () => {
    it('should return an empty array when no fields parameter is declared', (done) => {
      request(app)
        .get('/user')
        .expect(200)
        .end((err, res) => {
          if (err) { throw err }
          expect(res.body.middleWareData.fields).to.eql([])
          done()
        })
    })
    it('should return a valid array when single field value is given', (done) => {
      request(app)
        .get('/user?fields=id')
        .expect(200)
        .end((err, res) => {
          if (err) { throw err }
          expect(res.body.middleWareData.fields).to.eql(['id'])
          done()
        })
    })
    it('should return a valid array when multiple field values are given', (done) => {
      request(app)
        .get('/user?fields=id,userId,name')
        .expect(200)
        .end((err, res) => {
          if (err) { throw err }
          expect(res.body.middleWareData.fields).to.eql(['id', 'userId', 'name'])
          done()
        })
    })
    it('should return a valid array when single exclusion field value is given', (done) => {
      request(app)
        .get('/user?fields=-id')
        .expect(200)
        .end((err, res) => {
          if (err) { throw err }
          expect(res.body.middleWareData.fields).to.eql(['userId', 'name', 'createdAt'])
          done()
        })
    })
    it('should return a valid array when multiple exclusion fields are given', (done) => {
      request(app)
        .get('/user?fields=-id,-name')
        .expect(200)
        .end((err, res) => {
          if (err) { throw err }
          expect(res.body.middleWareData.fields).to.eql(['userId', 'createdAt'])
          done()
        })
    })
  })
})
