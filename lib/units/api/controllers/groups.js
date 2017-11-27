var Promise = require('bluebird')

var dbapi = require('../../../db/api')
var logger = require('../../../util/logger')

var log = logger.createLogger('api:controllers:devices')

module.exports = {
  getDeviceGroups: getDeviceGroups
  , getUserGroups: getUserGroups
}

function getDeviceGroups(req, res) {
  var fields = req.swagger.params.fields.value

  dbapi.loadDeviceGroups()
    .then(function(cursor) {
      return Promise.promisify(cursor.toArray, cursor)()
        .then(function(list) {
          res.json({
            success: true
          , groups: list
          })
        })
    })
    .catch(function(err) {
      log.error('Failed to load device groups: ', err.stack)
      res.status(500).json({
        success: false
      })
    })
}

function getUserGroups(req, res) {
  var fields = req.swagger.params.fields.value

  dbapi.loadUserGroups()
    .then(function(cursor) {
      return Promise.promisify(cursor.toArray, cursor)()
        .then(function(list) {
          res.json({
            success: true
            , groups: list
          })
        })
    })
    .catch(function(err) {
      log.error('Failed to load user groups: ', err.stack)
      res.status(500).json({
        success: false
      })
    })
}
